import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { promises as fs } from 'fs';
import * as chardet from 'chardet';
import * as path from 'path';
import {
  DetectFormatDto,
  DetectFormatResponseDto,
} from './dto/detect-format.dto';
import {
  ValidateImportDto,
  ValidateImportResponseDto,
  ValidationError,
} from './dto/validate-import.dto';
import {
  CommitImportDto,
  CommitImportResponseDto,
} from './dto/commit-import.dto';
import { HSIInventarioProcessor } from './processors/hsi-inventario.processor';

@Injectable()
export class ImportService {
  private hsiProcessor: HSIInventarioProcessor;

  constructor(private prisma: PrismaService) {
    this.hsiProcessor = new HSIInventarioProcessor(prisma);
  }

  /**
   * Detectar formato do CSV: encoding, delimiter, headers, sample
   */
  async detectFormat(dto: DetectFormatDto): Promise<DetectFormatResponseDto> {
    const { filePath, skipRows = 0 } = dto;

    // Verificar se arquivo existe
    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Detectar encoding
    const buffer = await fs.readFile(filePath);
    const detectedEncoding = chardet.detect(buffer) || 'utf-8';
    const encoding = (detectedEncoding.toLowerCase() === 'utf-8' ? 'utf-8' : 'latin1') as BufferEncoding;

    // Detectar delimiter (heurística simples - na linha de headers)
    const lines = buffer.toString(encoding).split('\n');
    const headerLine = lines[skipRows] || lines[0];
    const delimiter = this.detectDelimiter(headerLine);

    // Parsear CSV para extrair headers e amostra
    const records: any[] = [];
    const parser = createReadStream(filePath)
      .pipe(
        parse({
          delimiter,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          from: skipRows + 1,
          relax_column_count: true,
        }),
      );

    let rowCount = 0;
    for await (const record of parser) {
      if (rowCount < 5) {
        records.push(record);
      }
      rowCount++;
    }

    const headers = records.length > 0 ? Object.keys(records[0]) : [];

    // Detectar se é arquivo HSI Inventário pelas colunas características
    const isHSIInventario = this.isHSIInventarioFormat(headers);
    const detectedFileType = isHSIInventario ? 'hsi-inventario' : 'generic';

    return {
      encoding,
      delimiter,
      headers,
      sample: records,
      totalRows: rowCount,
      fileType: detectedFileType,
    };
  }

  /**
   * Detecta se o CSV é do formato HSI Inventário
   */
  private isHSIInventarioFormat(headers: string[]): boolean {
    const hsiColumns = [
      'Localização',
      'Hostname',
      'Patrimônio',
      'Serial Number CPU',
      'Fabricante',
      'Modelo',
      'Tipo de chassi',
      'Monitor 1',
      'Monitor 2',
      'Monitor 3',
    ];

    // Se tem pelo menos 6 das colunas características, é HSI
    const matchCount = hsiColumns.filter(col => 
      headers.some(h => h.trim() === col)
    ).length;

    return matchCount >= 6;
  }

  /**
   * Validar CSV sem persistir (dry-run)
   */
  async validateImport(
    dto: ValidateImportDto,
  ): Promise<ValidateImportResponseDto> {
    const { filePath, fileType, columnMapping = {}, config } = dto;

    const errors: ValidationError[] = [];
    let validRows = 0;
    let errorRows = 0;
    let warningRows = 0;

    const encoding = config?.encoding || 'utf-8';
    const delimiter = config?.delimiter || ';';
    const skipRows = config?.skipRows || 0;

    // Carregar mapeamento YAML se disponível
    const mappingRules = await this.loadMappingRules(fileType);

    // Parsear CSV
    const parser = createReadStream(filePath).pipe(
      parse({
        delimiter,
        columns: true,
        skip_empty_lines: true,
        trim: true,
        from: skipRows + 1,
        relax_column_count: true,
      }),
    );

    let rowNumber = skipRows + 1;
    for await (const record of parser) {
      rowNumber++;

      // Mapear colunas
      const mappedRecord = this.mapColumns(record, columnMapping);

      // Validar regras
      const rowErrors = this.validateRecord(
        mappedRecord,
        rowNumber,
        mappingRules,
      );

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        const hasErrors = rowErrors.some((e) => e.severity === 'error');
        if (hasErrors) {
          errorRows++;
        } else {
          warningRows++;
        }
      } else {
        validRows++;
      }
    }

    const stats = {
      totalRows: validRows + errorRows + warningRows,
      validRows,
      errorRows,
      warningRows,
    };

    return {
      isValid: errorRows === 0,
      validRows,
      errorRows,
      warningRows,
      errors: errors.slice(0, 100), // Retornar no máximo 100 erros
      stats,
    };
  }

  /**
   * Confirmar importação (criar job assíncrono)
   */
  async commitImport(
    dto: CommitImportDto,
    userId: string,
  ): Promise<CommitImportResponseDto> {
    const { filePath, fileType, columnMapping = {}, config } = dto;

    // Criar registro de ImportLog
    const importLog = await this.prisma.importLog.create({
      data: {
        filename: path.basename(filePath),
        originalName: path.basename(filePath),
        status: 'PENDING',
        userId,
        startedAt: new Date(),
      },
    });

    // TODO: Criar job no BullMQ (próxima etapa)
    // Por enquanto, processar síncrono para MVP
    const result = await this.processImportSync(
      filePath,
      fileType,
      columnMapping,
      config,
      importLog.id,
      userId,
    );

    // Atualizar ImportLog
    await this.prisma.importLog.update({
      where: { id: importLog.id },
      data: {
        status: result.success ? 'COMPLETED' : 'FAILED',
        completedAt: new Date(),
        totalRows: result.totalRows,
        successRows: result.successRows,
        errorRows: result.errorRows,
        errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
      },
    });

    return {
      jobId: `sync_${importLog.id}`,
      importLogId: importLog.id,
      message: result.success
        ? `Importação concluída: ${result.successRows} registros criados`
        : `Importação falhou: ${result.errorRows} erros`,
      status: result.success ? 'COMPLETED' : 'FAILED',
      ...result,
    };
  }

  /**
   * Processar importação de forma síncrona (temporário para MVP)
   */
  private async processImportSync(
    filePath: string,
    fileType: string,
    columnMapping: Record<string, string>,
    config: any,
    importLogId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    totalRows: number;
    successRows: number;
    errorRows: number;
    errors: any[];
  }> {
    const encoding = config?.encoding || 'utf-8';
    const delimiter = config?.delimiter || ';';
    const skipRows = config?.skipRows || 0;

    let totalRows = 0;
    let successRows = 0;
    let errorRows = 0;
    const errors: any[] = [];

    // Buscar categoria e localização padrão
    const defaultCategory = await this.findOrCreateCategory(
      config?.defaultCategory || 'Periféricos',
    );
    const defaultLocation = await this.findOrCreateLocation(
      config?.defaultLocation || 'Almoxarifado TI',
    );

    const parser = createReadStream(filePath).pipe(
      parse({
        delimiter,
        encoding,
        columns: true,
        skip_empty_lines: true,
        trim: true,
        from_line: skipRows + 1,
        relax_column_count: true,
      }),
    );

    // Detectar se é arquivo HSI Inventário
    const isHSIInventario = fileType === 'hsi-inventario' || 
      config?.isHSIInventario || 
      filePath.toLowerCase().includes('inventário') ||
      filePath.toLowerCase().includes('inventario');

    for await (const record of parser) {
      totalRows++;

      try {
        if (isHSIInventario) {
          // Processar usando o processor especializado HSI
          const result = await this.hsiProcessor.processRow(record, userId);
          
          if (result.erros.length > 0) {
            errorRows++;
            errors.push({
              row: totalRows,
              error: result.erros.join(', '),
            });
          } else {
            successRows++;
          }
        } else {
          // Processamento genérico (original)
          const mappedRecord = this.mapColumns(record, columnMapping);

          await this.prisma.asset.create({
            data: {
              name: mappedRecord.name,
              description: mappedRecord.notes || null,
              serialNumber: mappedRecord.serial_number || null,
              status: 'EM_ESTOQUE',
              purchasePrice: mappedRecord.price
                ? parseFloat(mappedRecord.price)
                : null,
              categoryId: defaultCategory.id,
              locationId: defaultLocation.id,
              createdById: userId,
            },
          });

          successRows++;
        }
      } catch (error) {
        errorRows++;
        errors.push({
          row: totalRows,
          error: error.message,
        });
      }
    }
    
    // Limpar cache do processor após importação
    if (isHSIInventario) {
      this.hsiProcessor.clearCache();
    }

    return {
      success: errorRows === 0,
      totalRows,
      successRows,
      errorRows,
      errors,
    };
  }

  /**
   * Detectar delimitador mais provável
   */
  private detectDelimiter(line: string): string {
    const delimiters = [';', ',', '\t', '|'];
    const counts = delimiters.map((d) => ({
      delimiter: d,
      count: (line.match(new RegExp(`\\${d}`, 'g')) || []).length,
    }));

    const best = counts.reduce((prev, current) =>
      current.count > prev.count ? current : prev,
    );

    return best.count > 0 ? best.delimiter : ';';
  }

  /**
   * Mapear colunas do CSV para campos do sistema
   */
  private mapColumns(
    record: Record<string, string>,
    mapping: Record<string, string>,
  ): Record<string, string> {
    const mapped: Record<string, string> = {};

    for (const [csvColumn, systemField] of Object.entries(mapping)) {
      const value = record[csvColumn];
      if (value !== undefined && value !== null) {
        mapped[systemField] = value.trim();
      }
    }

    return mapped;
  }

  /**
   * Validar registro contra regras do mapeamento
   */
  private validateRecord(
    record: Record<string, string>,
    rowNumber: number,
    rules: any,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validação básica: campo 'name' é obrigatório
    if (!record.name || record.name.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'name',
        message: 'Nome do ativo é obrigatório',
        severity: 'error',
      });
    }

    // Validar quantidade se presente
    if (record.quantity) {
      const qty = parseInt(record.quantity, 10);
      if (isNaN(qty) || qty < 0) {
        errors.push({
          row: rowNumber,
          field: 'quantity',
          message: 'Quantidade deve ser um número não-negativo',
          severity: 'error',
        });
      }
    }

    return errors;
  }

  /**
   * Carregar regras de mapeamento do arquivo YAML
   */
  private async loadMappingRules(fileType: string): Promise<any> {
    // TODO: Implementar parsing de YAML
    // Por enquanto, retornar regras vazias
    return {};
  }

  /**
   * Buscar ou criar categoria
   */
  private async findOrCreateCategory(name: string) {
    let category = await this.prisma.category.findFirst({
      where: { name },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: { name, description: `Auto-criado durante importação` },
      });
    }

    return category;
  }

  /**
   * Buscar ou criar localização
   */
  private async findOrCreateLocation(name: string) {
    let location = await this.prisma.location.findFirst({
      where: { name },
    });

    if (!location) {
      location = await this.prisma.location.create({
        data: { name, description: `Auto-criado durante importação` },
      });
    }

    return location;
  }

  /**
   * Gerar tag única para ativo
   */
  private generateTag(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `AST-${timestamp}-${random}`.toUpperCase();
  }
}

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
import { ImportQueue } from '../queues/import.queue';

@Injectable()
export class ImportService {
  private hsiProcessor: HSIInventarioProcessor;

  constructor(
    private prisma: PrismaService,
    private importQueue: ImportQueue,
  ) {
    this.hsiProcessor = new HSIInventarioProcessor(prisma);
  }

  /**
   * Valida se o caminho do arquivo é seguro (previne path traversal)
   */
  private isPathSafe(filePath: string): boolean {
    const uploadDir = path.resolve('./uploads');
    const resolvedPath = path.resolve(filePath);
    
    // Verifica se o caminho resolvido está dentro do diretório de uploads
    // e não contém sequências de path traversal
    return resolvedPath.startsWith(uploadDir) && !filePath.includes('..');
  }

  /**
   * Detectar formato do CSV: encoding, delimiter, headers, sample
   */
  async detectFormat(dto: DetectFormatDto): Promise<DetectFormatResponseDto> {
    const { filePath, skipRows = 0 } = dto;

    // Validar caminho do arquivo para prevenir path traversal
    if (!this.isPathSafe(filePath)) {
      throw new BadRequestException('Caminho de arquivo inválido ou não permitido');
    }

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

    // Gerar sugestões de mapeamento
    const suggestedMappings = this.suggestColumnMappings(headers, detectedFileType);

    // Calcular estatísticas
    const stats = this.calculateFileStats(records, rowCount);

    return {
      encoding,
      delimiter,
      headers,
      sample: records,
      totalRows: rowCount,
      fileType: detectedFileType,
      suggestedMappings,
      stats,
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
   * Sugerir mapeamento de colunas baseado em heurística
   */
  private suggestColumnMappings(
    headers: string[],
    fileType: string,
  ): Array<{ csvColumn: string; systemField: string; confidence: number }> {
    const mappings: Array<{ csvColumn: string; systemField: string; confidence: number }> = [];

    // Se é HSI Inventário, mapeamento é direto (não precisa)
    if (fileType === 'hsi-inventario') {
      return [
        { csvColumn: 'Patrimônio', systemField: 'assetTag', confidence: 1.0 },
        { csvColumn: 'Hostname', systemField: 'name', confidence: 1.0 },
        { csvColumn: 'Serial Number CPU', systemField: 'serialNumber', confidence: 1.0 },
        { csvColumn: 'Modelo', systemField: 'model', confidence: 1.0 },
        { csvColumn: 'Fabricante', systemField: 'manufacturer', confidence: 1.0 },
        { csvColumn: 'Localização', systemField: 'location', confidence: 1.0 },
      ];
    }

    // Mapeamentos genéricos por similaridade
    const fieldMappings: Record<string, { systemField: string; keywords: string[] }> = {
      name: { systemField: 'name', keywords: ['nome', 'item', 'descrição', 'descricao', 'produto'] },
      assetTag: { systemField: 'assetTag', keywords: ['patrimônio', 'patrimonio', 'tag', 'código', 'codigo'] },
      serialNumber: { systemField: 'serialNumber', keywords: ['serial', 'serial number', 'ns', 'número de série'] },
      model: { systemField: 'model', keywords: ['modelo', 'model'] },
      quantity: { systemField: 'quantity', keywords: ['quantidade', 'qtd', 'estoque', 'saldo'] },
      price: { systemField: 'price', keywords: ['preço', 'preco', 'valor', 'custo'] },
      manufacturer: { systemField: 'manufacturer', keywords: ['fabricante', 'marca', 'manufacturer'] },
      location: { systemField: 'location', keywords: ['localização', 'localizacao', 'local', 'setor'] },
    };

    for (const header of headers) {
      const normalizedHeader = this.normalizeText(header);
      
      for (const [_, mapping] of Object.entries(fieldMappings)) {
        for (const keyword of mapping.keywords) {
          const normalizedKeyword = this.normalizeText(keyword);
          
          if (normalizedHeader.includes(normalizedKeyword)) {
            const confidence = normalizedHeader === normalizedKeyword ? 1.0 : 0.8;
            mappings.push({
              csvColumn: header,
              systemField: mapping.systemField,
              confidence,
            });
            break;
          }
        }
      }
    }

    return mappings;
  }

  /**
   * Calcular estatísticas do arquivo
   */
  private calculateFileStats(
    sample: Record<string, string>[],
    totalRows: number,
  ): Record<string, any> {
    const hasEmptyRows = sample.some(row => 
      Object.values(row).every(val => !val || val.trim() === '')
    );

    const columnCounts = sample.map(row => Object.keys(row).length);
    const hasInconsistentColumns = new Set(columnCounts).size > 1;

    // Estimar tempo de processamento (1000 linhas/segundo)
    const estimatedSeconds = Math.ceil(totalRows / 1000);
    const estimatedProcessingTime = estimatedSeconds < 1 ? 'menos de 1 segundo' : 
      estimatedSeconds === 1 ? '1 segundo' : 
      estimatedSeconds < 60 ? `${estimatedSeconds} segundos` : 
      `${Math.ceil(estimatedSeconds / 60)} minutos`;

    return {
      hasEmptyRows,
      hasInconsistentColumns,
      estimatedProcessingTime,
      sampleSize: sample.length,
      totalRows,
    };
  }

  /**
   * Normalizar texto para comparação
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /**
   * Validar CSV sem persistir (dry-run)
   */
  async validateImport(
    dto: ValidateImportDto,
  ): Promise<ValidateImportResponseDto> {
    const { filePath, fileType, columnMapping = {}, config } = dto;

    // Validar caminho do arquivo para prevenir path traversal
    if (!this.isPathSafe(filePath)) {
      throw new BadRequestException('Caminho de arquivo inválido ou não permitido');
    }

    const errors: ValidationError[] = [];
    let validRows = 0;
    let errorRows = 0;
    let warningRows = 0;

    const encoding = config?.encoding || 'utf-8';
    const delimiter = config?.delimiter || ';';
    const skipRows = config?.skipRows || 0;

    // Estatísticas detalhadas
    const detailedStats = {
      newAssets: 0,
      existingAssets: 0,
      newCategories: new Set<string>(),
      newLocations: new Set<string>(),
      newManufacturers: new Set<string>(),
      assetsToCreate: [] as any[],
      assetsToUpdate: [] as any[],
    };

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
    const isHSIInventario = fileType === 'hsi-inventario';

    for await (const record of parser) {
      rowNumber++;

      try {
        if (isHSIInventario) {
          // Validação específica HSI
          const patrimonio = record['Patrimônio']?.trim();
          const hostname = record['Hostname']?.trim();

          if (!patrimonio && !hostname) {
            errors.push({
              row: rowNumber,
              field: 'Patrimônio/Hostname',
              message: 'Pelo menos um dos campos deve estar preenchido',
              severity: 'error',
            });
            errorRows++;
            continue;
          }

          // Verificar se já existe
          if (patrimonio || record['Serial Number CPU']) {
            const existing = await this.prisma.asset.findFirst({
              where: {
                OR: [
                  patrimonio ? { assetTag: patrimonio } : {},
                  record['Serial Number CPU'] ? { serialNumber: record['Serial Number CPU'].trim() } : {},
                ].filter(obj => Object.keys(obj).length > 0),
              },
              select: { id: true, name: true, assetTag: true },
            });

            if (existing) {
              detailedStats.existingAssets++;
              detailedStats.assetsToUpdate.push({
                name: hostname || existing.name,
                assetTag: patrimonio || existing.assetTag,
                action: 'update',
                existingId: existing.id,
              });
            } else {
              detailedStats.newAssets++;
              detailedStats.assetsToCreate.push({
                name: hostname || `Computador ${patrimonio}`,
                assetTag: patrimonio,
                action: 'create',
              });
            }
          }

          // Verificar entidades que serão criadas
          const location = record['Localização']?.trim();
          if (location) detailedStats.newLocations.add(location);

          const manufacturer = record['Fabricante']?.trim();
          if (manufacturer) detailedStats.newManufacturers.add(manufacturer);

          validRows++;
        } else {
          // Validação genérica
          const mappedRecord = this.mapColumns(record, columnMapping);
          const rowErrors = this.validateRecord(mappedRecord, rowNumber, mappingRules);

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
            detailedStats.newAssets++;
            detailedStats.assetsToCreate.push({
              name: mappedRecord.name,
              action: 'create',
            });
          }
        }
      } catch (error) {
        errors.push({
          row: rowNumber,
          field: 'general',
          message: error.message,
          severity: 'error',
        });
        errorRows++;
      }
    }

    // Estimar tempo de processamento
    const totalRows = validRows + errorRows + warningRows;
    const estimatedSeconds = Math.ceil(totalRows / 500); // 500 registros/segundo
    const estimatedDuration = estimatedSeconds < 1 ? 'menos de 1 segundo' : 
      estimatedSeconds === 1 ? '1 segundo' : 
      estimatedSeconds < 60 ? `${estimatedSeconds} segundos` : 
      `${Math.ceil(estimatedSeconds / 60)} minutos`;

    const stats = {
      totalRows,
      validRows,
      errorRows,
      warningRows,
      newAssets: detailedStats.newAssets,
      existingAssets: detailedStats.existingAssets,
      newCategories: 0, // Calculado durante processamento
      newLocations: detailedStats.newLocations.size,
      newManufacturers: detailedStats.newManufacturers.size,
      estimatedDuration,
      preview: {
        assetsToCreate: detailedStats.assetsToCreate.length,
        assetsToUpdate: detailedStats.assetsToUpdate.length,
        movementsToCreate: totalRows, // Uma movimentação por linha
      },
    };

    const preview = {
      assetsToCreate: detailedStats.assetsToCreate.slice(0, 5), // Primeiros 5
      assetsToUpdate: detailedStats.assetsToUpdate.slice(0, 5),
    };

    return {
      isValid: errorRows === 0,
      validRows,
      errorRows,
      warningRows,
      errors: errors.slice(0, 100), // Retornar no máximo 100 erros
      stats,
      preview,
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

    // Validar caminho do arquivo para prevenir path traversal
    if (!this.isPathSafe(filePath)) {
      throw new BadRequestException('Caminho de arquivo inválido ou não permitido');
    }

    const filename = path.basename(filePath);

    // Create ImportLog with PENDING status
    const importLog = await this.prisma.importLog.create({
      data: {
        filename,
        originalName: filename,
        fileType,
        status: 'PENDING',
        totalRows: 0,
        metadata: JSON.stringify({ columnMapping, config }),
        userId,
      },
    });

    // Add job to BullMQ
    const jobId = await this.importQueue.addJob({
      importLogId: importLog.id,
      filename,
      mappings: columnMapping,
      userId,
    });

    return {
      jobId,
      importLogId: importLog.id,
      message: 'Importação enfileirada para processamento assíncrono',
      status: 'PENDING',
    };
  }

  /**
   * Detectar delimitador mais provável (método auxiliar)
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
   * Validar registro contra regras
   */
  private validateRecord(
    record: Record<string, string>,
    rowNumber: number,
    rules: any,
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    if (!record.name || record.name.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'name',
        message: 'Nome do ativo é obrigatório',
        severity: 'error',
      });
    }
    return errors;
  }

  /**
   * Carregar regras de mapeamento
   */
  private async loadMappingRules(fileType: string): Promise<any> {
    return {}; // Placeholder
  }



  /**
   * Get import job status
   */
  async getJobStatus(importLogId: string) {
    const importLog = await this.prisma.importLog.findUnique({
      where: { id: importLogId },
    });

    if (!importLog) {
      throw new NotFoundException('Import log not found');
    }

    return {
      id: importLog.id,
      filename: importLog.filename,
      status: importLog.status,
      progress: importLog.progress,
      totalRows: importLog.totalRows,
      successRows: importLog.successRows,
      errorRows: importLog.errorRows,
      stats: importLog.stats ? JSON.parse(importLog.stats) : null,
      errors: importLog.errors ? JSON.parse(importLog.errors) : null,
      startedAt: importLog.startedAt,
      completedAt: importLog.completedAt,
      duration: importLog.duration,
    };
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

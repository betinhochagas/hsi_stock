import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImportJobData } from './import.queue';
import { parse } from 'csv-parse';
import * as chardet from 'chardet';
import { promises as fs } from 'fs';
import { HSIInventarioProcessor } from '../import/processors/hsi-inventario.processor';

@Injectable()
@Processor('import')
export class ImportProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportProcessor.name);
  private hsiProcessor: HSIInventarioProcessor;

  constructor(private readonly prisma: PrismaService) {
    super();
    this.hsiProcessor = new HSIInventarioProcessor(prisma);
  }

  async process(job: Job<ImportJobData>): Promise<any> {
    const { importLogId, filename, mappings, userId } = job.data;
    // filename já contém o caminho completo (uploads/temp/...)
    const filePath = filename.startsWith('./') ? filename : `./${filename}`;

    this.logger.log(`Processing import job ${job.id} for ${filename}`);

    const startTime = Date.now();

    try {
      // Update status to PROCESSING
      await this.prisma.importLog.update({
        where: { id: importLogId },
        data: { status: 'PROCESSING', progress: 0 },
      });

      // Detect encoding
      const buffer = await fs.readFile(filePath);
      const detectedEncoding = chardet.detect(buffer);
      
      // Mapear encoding detectado para valores válidos do Node.js
      let encoding: BufferEncoding = 'utf-8';
      if (detectedEncoding) {
        const encodingLower = detectedEncoding.toLowerCase();
        if (encodingLower.includes('utf-8') || encodingLower.includes('utf8')) {
          encoding = 'utf-8';
        } else if (encodingLower.includes('iso-8859') || encodingLower.includes('latin')) {
          encoding = 'latin1';
        } else if (encodingLower.includes('windows-1252') || encodingLower.includes('cp1252')) {
          encoding = 'latin1'; // Windows-1252 é superset de latin1
        }
      }
      
      this.logger.log(`Detected encoding: ${detectedEncoding} -> using ${encoding}`);

      // Read file with correct encoding
      const fileContent = await fs.readFile(filePath, encoding);
      
      // Detect delimiter
      const lines = fileContent.split('\n');
      const headerLine = lines[0];
      const delimiter = this.detectDelimiter(headerLine);

      // Parse and count total rows first
      let totalRows = 0;
      const countParser = parse(fileContent, {
        delimiter,
        columns: true,
        skip_empty_lines: true,
        skip_records_with_empty_values: true,
        trim: true,
        relax_column_count: true,
      });

      for await (const _ of countParser) {
        totalRows++;
      }

      await this.prisma.importLog.update({
        where: { id: importLogId },
        data: { totalRows },
      });

      // Detect file type
      const firstRecords: any[] = [];
      const sampleParser = parse(fileContent, {
        delimiter,
        columns: true,
        skip_empty_lines: true,
        skip_records_with_empty_values: true,
        trim: true,
        relax_column_count: true,
      });

      let count = 0;
      for await (const record of sampleParser) {
        firstRecords.push(record);
        count++;
        if (count >= 5) break;
      }

      const headers = firstRecords.length > 0 ? Object.keys(firstRecords[0]) : [];
      const isHSI = this.isHSIInventarioFormat(headers);

      // Process the file
      let result: any;
      if (isHSI) {
        result = await this.processHSIInventario(fileContent, delimiter, job, importLogId, totalRows);
      } else {
        result = await this.processGenericCSV(fileContent, delimiter, mappings, job, importLogId, totalRows);
      }

      const duration = Math.floor((Date.now() - startTime) / 1000);

      // Update final status
      await this.prisma.importLog.update({
        where: { id: importLogId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
          duration,
          stats: JSON.stringify(result.stats),
          successRows: result.stats.totalProcessed,
          errorRows: result.errors?.length || 0,
          errors: result.errors ? JSON.stringify(result.errors) : null,
        },
      });

      this.logger.log(`Import job ${job.id} completed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Import job ${job.id} failed:`, error);

      const duration = Math.floor((Date.now() - startTime) / 1000);

      await this.prisma.importLog.update({
        where: { id: importLogId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          duration,
          errors: JSON.stringify([{ message: error.message, stack: error.stack }]),
        },
      });

      throw error;
    }
  }

  private async processHSIInventario(
    fileContent: string,
    delimiter: string,
    job: Job,
    importLogId: string,
    totalRows: number,
  ) {
    // Process HSI Inventário using chunk-based streaming
    return await this.processGenericCSV(fileContent, delimiter, {}, job, importLogId, totalRows);
  }

  private async processGenericCSV(
    fileContent: string,
    delimiter: string,
    mappings: Record<string, string>,
    job: Job,
    importLogId: string,
    totalRows: number,
  ) {
    const userId = job.data.userId;

    const parser = parse(fileContent, {
      delimiter,
      columns: true,
      skip_empty_lines: true,
      skip_records_with_empty_values: true,
      trim: true,
      relax_column_count: true,
    });

    let processed = 0;
    let created = 0;
    let updated = 0;
    const errors: any[] = [];

    const chunkSize = 50;
    let chunk: any[] = [];

    for await (const record of parser) {
      chunk.push(record);

      if (chunk.length >= chunkSize) {
        const batchResult = await this.processChunk(chunk, mappings, userId);
        created += batchResult.created;
        updated += batchResult.updated;
        errors.push(...batchResult.errors);

        processed += chunk.length;
        const progress = Math.floor((processed / totalRows) * 100);
        await job.updateProgress(progress);

        await this.prisma.importLog.update({
          where: { id: importLogId },
          data: { progress },
        });

        chunk = [];
      }
    }

    // Process remaining records
    if (chunk.length > 0) {
      const batchResult = await this.processChunk(chunk, mappings, userId);
      created += batchResult.created;
      updated += batchResult.updated;
      errors.push(...batchResult.errors);
      processed += chunk.length;
    }

    return {
      stats: {
        totalProcessed: processed,
        assetsCreated: created,
        assetsUpdated: updated,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : null,
    };
  }

  private async processChunk(chunk: any[], mappings: Record<string, string>, userId: string) {
    let created = 0;
    let updated = 0;
    const errors: any[] = [];

    for (const record of chunk) {
      try {
        // Verificar se a linha está completamente vazia ou só tem dados irrelevantes
        const values = Object.values(record).filter(value => value && String(value).trim() !== '');
        
        // Se não tem nenhum valor OU só tem "Não encontrado", ignora
        if (values.length === 0 || (values.length === 1 && String(values[0]).includes('encontrado'))) {
          continue; // Ignora linha vazia ou inválida sem gerar erro
        }

        const mappedData: any = {};
        for (const [csvColumn, systemField] of Object.entries(mappings)) {
          if (systemField !== 'ignore' && record[csvColumn]) {
            mappedData[systemField] = record[csvColumn];
          }
        }

        if (!mappedData.assetTag || !mappedData.name) {
          errors.push({ record, message: 'Missing required fields: assetTag or name' });
          continue;
        }

        // Check if asset exists
        const existing = await this.prisma.asset.findUnique({
          where: { assetTag: mappedData.assetTag },
        });

        if (existing) {
          await this.prisma.asset.update({
            where: { id: existing.id },
            data: {
              name: mappedData.name,
              serialNumber: mappedData.serialNumber,
              model: mappedData.model,
              description: mappedData.notes || null,
            },
          });
          updated++;
        } else {
          // Get or create category
          let categoryId: string | null = null;
          if (mappedData.category) {
            const category = await this.prisma.category.upsert({
              where: { name: mappedData.category },
              update: {},
              create: { name: mappedData.category, description: '' },
            });
            categoryId = category.id;
          }

          // Get or create location
          let locationId: string | null = null;
          if (mappedData.location) {
            const location = await this.prisma.location.upsert({
              where: { name: mappedData.location },
              update: {},
              create: { name: mappedData.location, description: '' },
            });
            locationId = location.id;
          }

          await this.prisma.asset.create({
            data: {
              assetTag: mappedData.assetTag,
              name: mappedData.name,
              serialNumber: mappedData.serialNumber,
              model: mappedData.model,
              status: mappedData.status || 'EM_ESTOQUE',
              description: mappedData.notes || null,
              categoryId,
              locationId,
              createdById: userId,
            },
          });
          created++;
        }
      } catch (error) {
        errors.push({ record, message: error.message });
      }
    }

    return { created, updated, errors };
  }

  private detectDelimiter(line: string): string {
    const delimiters = [',', ';', '\t', '|'];
    let maxCount = 0;
    let detectedDelimiter = ',';

    for (const delimiter of delimiters) {
      const count = line.split(delimiter).length;
      if (count > maxCount) {
        maxCount = count;
        detectedDelimiter = delimiter;
      }
    }

    return detectedDelimiter;
  }

  private isHSIInventarioFormat(headers: string[]): boolean {
    const requiredColumns = [
      'nome',
      'tipo',
      'marca',
      'modelo',
      'numero de serie',
      'setor',
      'usuario conectado',
    ];

    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

    return requiredColumns.every((col) =>
      normalizedHeaders.some((h) => h.includes(col)),
    );
  }
}

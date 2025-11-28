import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImportJobData } from './import.queue';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import * as chardet from 'chardet';
import { promises as fs } from 'fs';
import { AssetStatus } from '@prisma/client';

interface ImportResult {
  stats: {
    totalProcessed: number;
    assetsCreated: number;
    assetsUpdated: number;
    errors: number;
  };
  errors: ImportError[] | null;
}

interface ImportError {
  record?: Record<string, string>;
  message: string;
}

@Injectable()
@Processor('import')
export class ImportProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<ImportJobData>): Promise<ImportResult> {
    const { importLogId, filename, mappings } = job.data;
    const filePath = `./uploads/${filename}`;

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
      const detectedEncoding = chardet.detect(buffer) || 'utf-8';
      const encoding = (detectedEncoding.toLowerCase() === 'utf-8' ? 'utf-8' : 'latin1') as BufferEncoding;

      // Detect delimiter
      const lines = buffer.toString(encoding).split('\n');
      const headerLine = lines[0];
      const delimiter = this.detectDelimiter(headerLine);

      // Parse and count total rows first
      let totalRows = 0;
      const countParser = createReadStream(filePath).pipe(
        parse({
          delimiter,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
        }),
      );

      for await (const _record of countParser) {
        totalRows++;
      }

      await this.prisma.importLog.update({
        where: { id: importLogId },
        data: { totalRows },
      });

      // Detect file type
      const firstRecords: Record<string, string>[] = [];
      const sampleParser = createReadStream(filePath).pipe(
        parse({
          delimiter,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
        }),
      );

      let count = 0;
      for await (const record of sampleParser) {
        firstRecords.push(record as Record<string, string>);
        count++;
        if (count >= 5) break;
      }

      const headers = firstRecords.length > 0 ? Object.keys(firstRecords[0]) : [];
      const isHSI = this.isHSIInventarioFormat(headers);

      // Process the file
      let result: ImportResult;
      if (isHSI) {
        result = await this.processHSIInventario(filePath, job, importLogId, totalRows);
      } else {
        result = await this.processGenericCSV(filePath, mappings, job, importLogId, totalRows);
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      await this.prisma.importLog.update({
        where: { id: importLogId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          duration,
          errors: JSON.stringify([{ message: errorMessage, stack: errorStack }]),
        },
      });

      throw error;
    }
  }

  private async processHSIInventario(
    filePath: string,
    job: Job,
    importLogId: string,
    totalRows: number,
  ) {
    // Process HSI Inventário using chunk-based streaming
    return await this.processGenericCSV(filePath, {}, job, importLogId, totalRows);
  }

  private async processGenericCSV(
    filePath: string,
    mappings: Record<string, string>,
    job: Job,
    importLogId: string,
    totalRows: number,
  ) {
    const userId = job.data.userId;
    const buffer = await fs.readFile(filePath);
    const detectedEncoding = chardet.detect(buffer) || 'utf-8';
    const encoding = (detectedEncoding.toLowerCase() === 'utf-8' ? 'utf-8' : 'latin1') as BufferEncoding;

    const lines = buffer.toString(encoding).split('\n');
    const delimiter = this.detectDelimiter(lines[0]);

    const parser = createReadStream(filePath).pipe(
      parse({
        delimiter,
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      }),
    );

    let processed = 0;
    let created = 0;
    let updated = 0;
    const errors: ImportError[] = [];

    const chunkSize = 50;
    let chunk: Record<string, string>[] = [];

    for await (const record of parser) {
      chunk.push(record as Record<string, string>);

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

  private async processChunk(chunk: Record<string, string>[], mappings: Record<string, string>, userId: string) {
    let created = 0;
    let updated = 0;
    const errors: ImportError[] = [];

    for (const record of chunk) {
      try {
        const mappedData: Record<string, string> = {};
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
              status: (mappedData.status as AssetStatus) || AssetStatus.EM_ESTOQUE,
              description: mappedData.notes || null,
              categoryId,
              locationId,
              createdById: userId,
            },
          });
          created++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ record, message: errorMessage });
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

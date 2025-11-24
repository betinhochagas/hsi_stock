import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Param,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Observable, interval, map, switchMap, takeWhile } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImportService } from './import.service';
import {
  DetectFormatDto,
  DetectFormatResponseDto,
} from './dto/detect-format.dto';
import {
  ValidateImportDto,
  ValidateImportResponseDto,
} from './dto/validate-import.dto';
import {
  CommitImportDto,
  CommitImportResponseDto,
} from './dto/commit-import.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload de arquivo CSV',
    description:
      'Faz upload do arquivo CSV para o servidor e retorna o caminho temporário',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Arquivo enviado com sucesso',
    schema: {
      example: {
        filePath: 'uploads/temp/balanco-estoque-1234567890.csv',
        filename: 'balanco-estoque.csv',
        size: 52480,
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.originalname.replace(ext, '')}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(csv|txt)$/)) {
          return callback(
            new BadRequestException('Apenas arquivos CSV são permitidos'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo não foi enviado');
    }

    return {
      filePath: file.path,
      filename: file.originalname,
      size: file.size,
    };
  }

  @Post('detect')
  @ApiOperation({
    summary: 'Detectar formato do CSV',
    description:
      'Detecta automaticamente encoding, delimitador, headers e retorna amostra',
  })
  @ApiResponse({
    status: 200,
    description: 'Formato detectado com sucesso',
    type: DetectFormatResponseDto,
  })
  async detectFormat(
    @Body() dto: DetectFormatDto,
  ): Promise<DetectFormatResponseDto> {
    return this.importService.detectFormat(dto);
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validar CSV (dry-run)',
    description:
      'Valida o CSV sem persistir no banco, retornando relatório de erros',
  })
  @ApiResponse({
    status: 200,
    description: 'Validação concluída',
    type: ValidateImportResponseDto,
  })
  async validateImport(
    @Body() dto: ValidateImportDto,
  ): Promise<ValidateImportResponseDto> {
    return this.importService.validateImport(dto);
  }

  @Post('commit')
  @ApiOperation({
    summary: 'Confirmar importação',
    description: 'Cria job assíncrono para processar e persistir os dados',
  })
  @ApiResponse({
    status: 201,
    description: 'Importação iniciada',
    type: CommitImportResponseDto,
  })
  async commitImport(
    @Body() dto: CommitImportDto,
    @CurrentUser() user: any,
  ): Promise<CommitImportResponseDto> {
    return this.importService.commitImport(dto, user.userId);
  }

  @Get('jobs/:id/status')
  @ApiOperation({
    summary: 'Consultar status de importação',
    description: 'Retorna o status e progresso de um job de importação',
  })
  @ApiResponse({
    status: 200,
    description: 'Status do job',
    schema: {
      example: {
        id: 'cljk123456',
        filename: 'HSI Inventário.csv',
        status: 'PROCESSING',
        progress: 45,
        totalRows: 1485,
        successRows: 668,
        errorRows: 2,
        stats: {
          assetsCreated: 650,
          assetsUpdated: 18,
          movementsCreated: 668,
        },
        startedAt: '2025-11-18T10:00:00Z',
        completedAt: null,
        duration: null,
      },
    },
  })
  async getJobStatus(@Param('id') id: string) {
    return this.importService.getJobStatus(id);
  }

  @Sse('jobs/:id/progress')
  @ApiOperation({
    summary: 'Acompanhar progresso em tempo real (SSE)',
    description: 'Stream de eventos com atualizações de progresso do job de importação',
  })
  @ApiResponse({
    status: 200,
    description: 'Stream de eventos SSE',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          example: {
            id: 'cljk123456',
            status: 'PROCESSING',
            progress: 45,
            totalRows: 1485,
            successRows: 668,
          },
        },
      },
    },
  })
  streamJobProgress(@Param('id') id: string): Observable<MessageEvent> {
    return interval(1000).pipe(
      switchMap(() => this.importService.getJobStatus(id)),
      takeWhile((status) => {
        // Continue streaming while job is not in final state
        return status.status === 'PENDING' || status.status === 'PROCESSING';
      }, true), // Include the final emission
      map((status) => ({
        data: {
          id: status.id,
          filename: status.filename,
          status: status.status,
          progress: status.progress,
          totalRows: status.totalRows,
          successRows: status.successRows,
          errorRows: status.errorRows,
          stats: status.stats,
          startedAt: status.startedAt,
          completedAt: status.completedAt,
          duration: status.duration,
        },
      })),
    );
  }
}
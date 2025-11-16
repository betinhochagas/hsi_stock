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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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
    return this.importService.commitImport(dto, user.id);
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
        id: 'sync_uuid-123',
        status: 'COMPLETED',
        progress: 100,
        totalRows: 118,
        successRows: 115,
        errorRows: 3,
        errors: [],
      },
    },
  })
  async getJobStatus(@Param('id') id: string) {
    // TODO: Implementar consulta de job do BullMQ
    return {
      id,
      status: 'NOT_IMPLEMENTED',
      message:
        'Consulta de jobs assíncronos será implementada na próxima etapa',
    };
  }
}

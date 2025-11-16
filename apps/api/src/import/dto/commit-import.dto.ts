import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CommitImportDto {
  @ApiProperty({
    description: 'Caminho do arquivo CSV',
    example: 'uploads/temp/balanco-estoque.csv',
  })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({
    description: 'Tipo de arquivo',
    example: 'balance',
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({
    description: 'Mapeamento de colunas',
  })
  @IsObject()
  @IsNotEmpty()
  columnMapping: Record<string, string>;

  @ApiProperty({
    description: 'Configuração adicional',
    required: false,
  })
  @IsObject()
  config?: {
    encoding?: string;
    delimiter?: string;
    skipRows?: number;
    createMovements?: boolean;
    defaultCategory?: string;
    defaultLocation?: string;
  };
}

export class CommitImportResponseDto {
  @ApiProperty({
    description: 'ID do job criado',
    example: 'job_123456',
  })
  jobId: string;

  @ApiProperty({
    description: 'ID do registro de importação',
    example: 'uuid-123',
  })
  importLogId: string;

  @ApiProperty({
    description: 'Mensagem de confirmação',
  })
  message: string;

  @ApiProperty({
    description: 'Status inicial',
    example: 'PENDING',
  })
  status: string;
}

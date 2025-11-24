import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class ValidateImportDto {
  @ApiProperty({
    description: 'Caminho do arquivo CSV',
    example: 'uploads/temp/balanco-estoque.csv',
  })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({
    description: 'Tipo de arquivo (balance, entry, exit)',
    example: 'balance',
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({
    description: 'Mapeamento de colunas CSV para campos do sistema (opcional para tipos especializados)',
    example: {
      Item: 'name',
      'Quantidade em estoque': 'quantity',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  columnMapping?: Record<string, string>;

  @ApiProperty({
    description: 'Configuração de encoding e delimiter',
    required: false,
  })
  @IsOptional()
  @IsObject()
  config?: {
    encoding?: string;
    delimiter?: string;
    skipRows?: number;
  };
}

export class ValidationError {
  @ApiProperty({ example: 5 })
  row: number;

  @ApiProperty({ example: 'name' })
  field: string;

  @ApiProperty({ example: 'Campo obrigatório não preenchido' })
  message: string;

  @ApiProperty({ example: 'error' })
  severity: 'error' | 'warning';
}

export class ValidateImportResponseDto {
  @ApiProperty({ description: 'Validação passou sem erros críticos' })
  isValid: boolean;

  @ApiProperty({ description: 'Total de linhas válidas' })
  validRows: number;

  @ApiProperty({ description: 'Total de linhas com erro' })
  errorRows: number;

  @ApiProperty({ description: 'Total de linhas com warning' })
  warningRows: number;

  @ApiProperty({
    description: 'Lista de erros e warnings',
    type: [ValidationError],
  })
  errors: ValidationError[];

  @ApiProperty({
    description: 'Estatísticas detalhadas de preview',
    example: {
      totalRows: 118,
      validRows: 110,
      errorRows: 5,
      warningRows: 3,
      newAssets: 110,
      existingAssets: 8,
      newCategories: 2,
      newLocations: 3,
      newManufacturers: 5,
      estimatedDuration: '3 segundos',
      preview: {
        assetsToCreate: 110,
        assetsToUpdate: 8,
        movementsToCreate: 118,
      },
    },
  })
  stats: Record<string, unknown>;

  @ApiProperty({
    description: 'Preview de registros que serão criados/atualizados',
    example: {
      assets: [
        { name: 'Notebook Dell', action: 'create', category: 'Notebook' },
        { name: 'Monitor LG', action: 'update', category: 'Monitor' },
      ],
    },
    required: false,
  })
  preview?: Record<string, unknown>;
}

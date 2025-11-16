import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class DetectFormatDto {
  @ApiProperty({
    description: 'Caminho do arquivo CSV enviado',
    example: 'uploads/temp/balanco-estoque.csv',
  })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({
    description: 'Número de linhas a pular (cabeçalhos extras)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  skipRows?: number;
}

export class DetectFormatResponseDto {
  @ApiProperty({ description: 'Encoding detectado', example: 'utf-8' })
  encoding: string;

  @ApiProperty({ description: 'Delimitador detectado', example: ';' })
  delimiter: string;

  @ApiProperty({
    description: 'Cabeçalhos (colunas) do CSV',
    example: ['Item', 'Entradas', 'Saídas', 'Quantidade em estoque'],
  })
  headers: string[];

  @ApiProperty({
    description: 'Amostra das primeiras 5 linhas',
    example: [
      { Item: 'Adaptador DisplayPort x VGA', Entradas: '8', Saídas: '3' },
    ],
  })
  sample: Record<string, string>[];

  @ApiProperty({ description: 'Total de linhas (aproximado)', example: 118 })
  totalRows: number;
}

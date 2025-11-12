import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  @ApiPropertyOptional({
    description: 'Número do patrimônio/ativo (único)',
    example: 'PAT-2025-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  assetTag?: string;

  @ApiProperty({
    description: 'Nome do ativo',
    example: 'Notebook Dell Latitude 5420',
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do ativo',
    example: 'Notebook corporativo com 16GB RAM, SSD 512GB',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Número de série / Service Tag',
    example: '8KXY3J3',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  serialNumber?: string;

  @ApiPropertyOptional({
    description: 'Modelo do ativo',
    example: 'Latitude 5420',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @ApiPropertyOptional({
    description: 'Status do ativo',
    enum: AssetStatus,
    example: 'EM_ESTOQUE',
    default: 'EM_ESTOQUE',
  })
  @IsOptional()
  @IsEnum(AssetStatus, {
    message: 'Status deve ser: EM_ESTOQUE, EM_USO, EM_MANUTENCAO, INATIVO ou DESCARTADO',
  })
  status?: AssetStatus;

  @ApiPropertyOptional({
    description: 'Data de compra',
    example: '2025-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de compra inválida' })
  purchaseDate?: Date;

  @ApiPropertyOptional({
    description: 'Preço de compra',
    example: 4500.00,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Preço deve ser um número' })
  purchasePrice?: number;

  @ApiPropertyOptional({
    description: 'Data de validade da garantia',
    example: '2028-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de garantia inválida' })
  warrantyUntil?: Date;

  @ApiPropertyOptional({
    description: 'Observações adicionais',
    example: 'Configuração específica para área de desenvolvimento',
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({
    description: 'ID da localização',
    example: 'clm1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID da localização inválido' })
  locationId?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário atribuído',
    example: 'clm1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID do usuário inválido' })
  assignedToId?: string;

  @ApiPropertyOptional({
    description: 'Data de atribuição',
    example: '2025-01-20T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de atribuição inválida' })
  assignedAt?: Date;

  @ApiProperty({
    description: 'ID da categoria',
    example: 'clm1234567890',
  })
  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  @IsUUID('4', { message: 'ID da categoria inválido' })
  categoryId: string;

  @ApiPropertyOptional({
    description: 'ID do fabricante',
    example: 'clm1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID do fabricante inválido' })
  manufacturerId?: string;

  @ApiPropertyOptional({
    description: 'ID do fornecedor',
    example: 'clm1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID do fornecedor inválido' })
  supplierId?: string;

  @ApiProperty({
    description: 'ID do usuário criador',
    example: 'clm1234567890',
  })
  @IsNotEmpty({ message: 'Usuário criador é obrigatório' })
  @IsUUID('4', { message: 'ID do usuário criador inválido' })
  createdById: string;
}

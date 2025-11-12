import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateLicenseDto {
  @ApiProperty({ example: 'Microsoft Office 365 Business', description: 'Nome da licença' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({ example: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX', description: 'Chave de ativação' })
  @IsString()
  @IsNotEmpty({ message: 'Chave de licença é obrigatória' })
  licenseKey: string;

  @ApiProperty({ example: 50, description: 'Total de seats disponíveis' })
  @IsInt({ message: 'Total de seats deve ser um número inteiro' })
  @Min(1, { message: 'Total de seats deve ser no mínimo 1' })
  totalSeats: number;

  @ApiProperty({ example: '2024-01-01', description: 'Data de compra' })
  @IsDateString({}, { message: 'Data de compra inválida' })
  purchaseDate: string;

  @ApiProperty({ example: '2025-12-31', description: 'Data de expiração' })
  @IsDateString({}, { message: 'Data de expiração inválida' })
  expirationDate: string;

  @ApiProperty({ example: 15000.00, description: 'Custo total', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Custo deve ser um número' })
  @Min(0, { message: 'Custo não pode ser negativo' })
  cost?: number;

  @ApiProperty({ example: 'Microsoft', description: 'Fornecedor', required: false })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiProperty({ example: 'Observações sobre a licença', description: 'Notas adicionais', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

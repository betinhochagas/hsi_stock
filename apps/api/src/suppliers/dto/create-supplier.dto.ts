import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'Nome do fornecedor',
    example: 'ABC Tecnologia Ltda',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'CNPJ do fornecedor',
    example: '12.345.678/0001-99',
  })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'Nome do contato',
    example: 'João Silva',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact?: string;

  @ApiPropertyOptional({
    description: 'Email do fornecedor',
    example: 'contato@abctec.com.br',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone do fornecedor',
    example: '(11) 3456-7890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Endereço completo do fornecedor',
    example: 'Rua Exemplo, 123 - São Paulo/SP',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}

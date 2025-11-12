import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsUrl, MaxLength } from 'class-validator';

export class CreateManufacturerDto {
  @ApiProperty({
    description: 'Nome do fabricante',
    example: 'Dell Technologies',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Website do fabricante',
    example: 'https://www.dell.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'Telefone de suporte',
    example: '+55 11 4004-3000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supportPhone?: string;

  @ApiPropertyOptional({
    description: 'Email de suporte',
    example: 'suporte@dell.com.br',
  })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;
}

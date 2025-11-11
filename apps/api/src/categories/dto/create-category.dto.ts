import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Notebooks',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição da categoria',
    example: 'Laptops e notebooks para uso corporativo',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Nome do ícone (ex: laptop, monitor, printer)',
    example: 'laptop',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Cor em hexadecimal para UI',
    example: '#3b82f6',
    maxLength: 7,
  })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}

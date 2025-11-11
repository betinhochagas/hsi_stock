import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Nome da localização',
    example: 'TI - Sala 102',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição da localização',
    example: 'Sala de TI no segundo andar',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Nome do prédio',
    example: 'Bloco A',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  building?: string;

  @ApiPropertyOptional({
    description: 'Andar',
    example: '2º Andar',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  floor?: string;

  @ApiPropertyOptional({
    description: 'Número ou nome da sala',
    example: '102',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  room?: string;
}

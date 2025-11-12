import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @ApiProperty({ 
    example: 'CHECK_OUT', 
    description: 'Tipo de movimentação',
    enum: ['CHECK_IN', 'CHECK_OUT', 'TRANSFER', 'ASSIGNMENT', 'RETURN']
  })
  @IsEnum(MovementType, { message: 'Tipo de movimentação inválido' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  type: MovementType;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000', 
    description: 'ID do ativo' 
  })
  @IsUUID('4', { message: 'ID do ativo deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID do ativo é obrigatório' })
  assetId: string;

  @ApiProperty({ 
    example: '650e8400-e29b-41d4-a716-446655440000', 
    description: 'ID do usuário responsável',
    required: false 
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID do usuário deve ser um UUID válido' })
  userId?: string;

  @ApiProperty({ 
    example: '750e8400-e29b-41d4-a716-446655440000', 
    description: 'ID da localização de origem',
    required: false 
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID da localização de origem deve ser um UUID válido' })
  fromLocationId?: string;

  @ApiProperty({ 
    example: 'Escritório Central - TI', 
    description: 'Localização de destino (texto livre)',
    required: false 
  })
  @IsOptional()
  @IsString()
  toLocation?: string;

  @ApiProperty({ 
    example: 'Notebook enviado para manutenção preventiva', 
    description: 'Motivo/razão da movimentação',
    required: false 
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ 
    example: 'TICKET-2024-1234', 
    description: 'Número do ticket de suporte',
    required: false 
  })
  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @ApiProperty({ 
    example: 'João Silva', 
    description: 'Nome de quem realizou a movimentação',
    required: false 
  })
  @IsOptional()
  @IsString()
  movedBy?: string;
}

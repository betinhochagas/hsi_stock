import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class AssignLicenseDto {
  @ApiProperty({ example: 'DESKTOP-JOAO-001', description: 'Nome do dispositivo/máquina', required: false })
  @IsOptional()
  @IsString()
  deviceName?: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome do usuário', required: false })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({ example: 'joao.silva@hsi.local', description: 'Email do usuário', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;
}

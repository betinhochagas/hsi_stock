import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MovementType, UserRole } from '@estoque-hsi/db';

@ApiTags('movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
  @ApiOperation({ summary: 'Registrar nova movimentação' })
  @ApiResponse({ status: 201, description: 'Movimentação registrada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou regras de negócio violadas' })
  @ApiResponse({ status: 404, description: 'Ativo, usuário ou localização não encontrados' })
  create(@Body() createMovementDto: CreateMovementDto) {
    return this.movementsService.create(createMovementDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Listar todas as movimentações' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a pular' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a retornar' })
  @ApiQuery({ name: 'assetId', required: false, type: String, description: 'Filtrar por ID do ativo' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filtrar por ID do usuário' })
  @ApiQuery({ name: 'type', required: false, enum: MovementType, description: 'Filtrar por tipo de movimentação' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Data inicial (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Data final (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Lista de movimentações' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('assetId') assetId?: string,
    @Query('userId') userId?: string,
    @Query('type') type?: MovementType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.movementsService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      assetId,
      userId,
      type,
      startDate,
      endDate,
    });
  }

  @Get('asset/:assetId')
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Buscar histórico de movimentações de um ativo' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Histórico de movimentações do ativo' })
  @ApiResponse({ status: 404, description: 'Ativo não encontrado' })
  findByAsset(
    @Param('assetId') assetId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.movementsService.findByAsset(assetId, {
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    });
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Buscar movimentações realizadas por/para um usuário' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Movimentações do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findByUser(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.movementsService.findByUser(userId, {
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Buscar movimentação por ID' })
  @ApiResponse({ status: 200, description: 'Movimentação encontrada' })
  @ApiResponse({ status: 404, description: 'Movimentação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.movementsService.findOne(id);
  }
}

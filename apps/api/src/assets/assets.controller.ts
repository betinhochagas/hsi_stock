import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { DashboardStatsDto } from './dto/stats-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@estoque-hsi/db';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get('stats/dashboard')
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso', type: DashboardStatsDto })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.assetsService.getDashboardStats();
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Listar ativos com paginação e filtros' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.assetsService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      search,
      status,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Buscar ativo por ID' })
  @ApiResponse({ status: 200, description: 'Ativo encontrado' })
  @ApiResponse({ status: 404, description: 'Ativo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
  @ApiOperation({ summary: 'Criar novo ativo' })
  @ApiResponse({ status: 201, description: 'Ativo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Relacionamento não encontrado (categoria, localização, etc.)' })
  @ApiResponse({ status: 409, description: 'Conflito - assetTag ou serialNumber duplicado' })
  async create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO)
  @ApiOperation({ summary: 'Atualizar ativo existente' })
  @ApiResponse({ status: 200, description: 'Ativo atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Ativo ou relacionamento não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito - assetTag ou serialNumber duplicado' })
  async update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  @ApiOperation({ summary: 'Remover ativo' })
  @ApiResponse({ status: 200, description: 'Ativo removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Ativo não encontrado' })
  @ApiResponse({ status: 409, description: 'Ativo possui vínculos (movimentações, manutenções, contratos)' })
  async remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}

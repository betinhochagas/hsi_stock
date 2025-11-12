import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LicensesService } from './licenses.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { AssignLicenseDto } from './dto/assign-license.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('licenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova licença' })
  @ApiResponse({ status: 201, description: 'Licença criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createLicenseDto: CreateLicenseDto) {
    return this.licensesService.create(createLicenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as licenças' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a pular' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a retornar' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Busca por nome, chave ou fornecedor' })
  @ApiResponse({ status: 200, description: 'Lista de licenças' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    return this.licensesService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      search,
    });
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Listar licenças expirando em X dias' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Número de dias (padrão: 30)' })
  @ApiResponse({ status: 200, description: 'Licenças expirando' })
  findExpiring(@Query('days') days?: string) {
    return this.licensesService.findExpiring(days ? parseInt(days) : 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar licença por ID' })
  @ApiResponse({ status: 200, description: 'Licença encontrada' })
  @ApiResponse({ status: 404, description: 'Licença não encontrada' })
  findOne(@Param('id') id: string) {
    return this.licensesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar licença' })
  @ApiResponse({ status: 200, description: 'Licença atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Licença não encontrada' })
  @ApiResponse({ status: 409, description: 'Conflito - tentando reduzir seats em uso' })
  update(@Param('id') id: string, @Body() updateLicenseDto: UpdateLicenseDto) {
    return this.licensesService.update(id, updateLicenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover licença' })
  @ApiResponse({ status: 200, description: 'Licença removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Licença não encontrada' })
  @ApiResponse({ status: 409, description: 'Licença possui atribuições ativas' })
  remove(@Param('id') id: string) {
    return this.licensesService.remove(id);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Atribuir seat de licença' })
  @ApiResponse({ status: 201, description: 'Seat atribuído com sucesso' })
  @ApiResponse({ status: 404, description: 'Licença não encontrada' })
  @ApiResponse({ status: 409, description: 'Todos os seats já estão em uso' })
  assign(@Param('id') id: string, @Body() assignDto: AssignLicenseDto) {
    return this.licensesService.assign(id, assignDto);
  }

  @Delete(':id/assignments/:assignmentId')
  @ApiOperation({ summary: 'Revogar atribuição de seat' })
  @ApiResponse({ status: 200, description: 'Atribuição revogada com sucesso' })
  @ApiResponse({ status: 404, description: 'Atribuição não encontrada' })
  @ApiResponse({ status: 409, description: 'Atribuição não pertence a esta licença' })
  revoke(@Param('id') id: string, @Param('assignmentId') assignmentId: string) {
    return this.licensesService.revoke(id, assignmentId);
  }
}

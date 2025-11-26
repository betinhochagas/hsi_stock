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
import { ManufacturersService } from './manufacturers.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@estoque-hsi/db';

@ApiTags('manufacturers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('manufacturers')
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  @ApiOperation({ summary: 'Criar novo fabricante' })
  @ApiResponse({ status: 201, description: 'Fabricante criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Fabricante com esse nome já existe' })
  create(@Body() createManufacturerDto: CreateManufacturerDto) {
    return this.manufacturersService.create(createManufacturerDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Listar todos os fabricantes' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Número de registros a pular' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Número de registros a retornar' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Busca por nome, website ou email' })
  @ApiResponse({ status: 200, description: 'Lista de fabricantes' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    return this.manufacturersService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      search,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Buscar fabricante por ID' })
  @ApiResponse({ status: 200, description: 'Fabricante encontrado' })
  @ApiResponse({ status: 404, description: 'Fabricante não encontrado' })
  findOne(@Param('id') id: string) {
    return this.manufacturersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  @ApiOperation({ summary: 'Atualizar fabricante' })
  @ApiResponse({ status: 200, description: 'Fabricante atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Fabricante não encontrado' })
  @ApiResponse({ status: 409, description: 'Fabricante com esse nome já existe' })
  update(@Param('id') id: string, @Body() updateManufacturerDto: UpdateManufacturerDto) {
    return this.manufacturersService.update(id, updateManufacturerDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  @ApiOperation({ summary: 'Remover fabricante' })
  @ApiResponse({ status: 200, description: 'Fabricante removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Fabricante não encontrado' })
  @ApiResponse({ status: 409, description: 'Fabricante possui ativos vinculados' })
  remove(@Param('id') id: string) {
    return this.manufacturersService.remove(id);
  }
}

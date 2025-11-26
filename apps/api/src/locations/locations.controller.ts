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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@estoque-hsi/db';

@ApiTags('locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  @ApiOperation({ summary: 'Criar nova localização' })
  @ApiResponse({ status: 201, description: 'Localização criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Localização com esse nome já existe' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Listar todas as localizações com paginação' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de localizações retornada com sucesso' })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    return this.locationsService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      search,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR, UserRole.TECNICO, UserRole.LEITOR)
  @ApiOperation({ summary: 'Buscar localização por ID' })
  @ApiResponse({ status: 200, description: 'Localização encontrada' })
  @ApiResponse({ status: 404, description: 'Localização não encontrada' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  @ApiOperation({ summary: 'Atualizar localização' })
  @ApiResponse({ status: 200, description: 'Localização atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Localização não encontrada' })
  @ApiResponse({ status: 409, description: 'Conflito de nome' })
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.GESTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover localização' })
  @ApiResponse({ status: 200, description: 'Localização removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Localização não encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Não é possível remover localização com ativos vinculados',
  })
  remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}

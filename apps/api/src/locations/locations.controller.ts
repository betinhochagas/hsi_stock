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

@ApiTags('locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova localização' })
  @ApiResponse({ status: 201, description: 'Localização criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Localização com esse nome já existe' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
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
  @ApiOperation({ summary: 'Buscar localização por ID' })
  @ApiResponse({ status: 200, description: 'Localização encontrada' })
  @ApiResponse({ status: 404, description: 'Localização não encontrada' })
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar localização' })
  @ApiResponse({ status: 200, description: 'Localização atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Localização não encontrada' })
  @ApiResponse({ status: 409, description: 'Conflito de nome' })
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(':id')
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

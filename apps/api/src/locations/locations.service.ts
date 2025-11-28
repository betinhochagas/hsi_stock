import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    // Verificar se já existe localização com esse nome
    const existing = await this.prisma.location.findUnique({
      where: { name: createLocationDto.name },
    });

    if (existing) {
      throw new ConflictException(`Localização com nome "${createLocationDto.name}" já existe`);
    }

    return this.prisma.location.create({
      data: createLocationDto,
    });
  }

  async findAll(params?: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params || {};

    const where: Prisma.LocationWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { building: { contains: search, mode: 'insensitive' } },
        { floor: { contains: search, mode: 'insensitive' } },
        { room: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { assets: true, movements: true },
          },
        },
      }),
      this.prisma.location.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true, movements: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundException(`Localização com ID "${id}" não encontrada`);
    }

    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    // Verificar se existe
    await this.findOne(id);

    // Verificar conflito de nome (se nome foi alterado)
    if (updateLocationDto.name) {
      const existing = await this.prisma.location.findUnique({
        where: { name: updateLocationDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Localização com nome "${updateLocationDto.name}" já existe`);
      }
    }

    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async remove(id: string) {
    // Verificar se existe
    const location = await this.findOne(id);

    // Verificar se tem ativos vinculados
    const assetCount = await this.prisma.asset.count({
      where: { locationId: id },
    });

    if (assetCount > 0) {
      throw new ConflictException(
        `Não é possível remover a localização "${location.name}" pois existem ${assetCount} ativo(s) vinculado(s)`,
      );
    }

    await this.prisma.location.delete({
      where: { id },
    });

    return { message: 'Localização removida com sucesso' };
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ManufacturersService {
  constructor(private prisma: PrismaService) {}

  async create(createManufacturerDto: CreateManufacturerDto) {
    // Verificar se já existe fabricante com esse nome
    const existing = await this.prisma.manufacturer.findUnique({
      where: { name: createManufacturerDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Fabricante com nome "${createManufacturerDto.name}" já existe`,
      );
    }

    return this.prisma.manufacturer.create({
      data: createManufacturerDto,
    });
  }

  async findAll(params?: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params || {};

    const where: Prisma.ManufacturerWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } },
        { supportEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.manufacturer.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { assets: true },
          },
        },
      }),
      this.prisma.manufacturer.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const manufacturer = await this.prisma.manufacturer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!manufacturer) {
      throw new NotFoundException(`Fabricante com ID "${id}" não encontrado`);
    }

    return manufacturer;
  }

  async update(id: string, updateManufacturerDto: UpdateManufacturerDto) {
    // Verificar se existe
    await this.findOne(id);

    // Verificar conflito de nome (se nome foi alterado)
    if (updateManufacturerDto.name) {
      const existing = await this.prisma.manufacturer.findUnique({
        where: { name: updateManufacturerDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Fabricante com nome "${updateManufacturerDto.name}" já existe`,
        );
      }
    }

    return this.prisma.manufacturer.update({
      where: { id },
      data: updateManufacturerDto,
    });
  }

  async remove(id: string) {
    // Verificar se existe
    const manufacturer = await this.findOne(id);

    // Verificar se tem ativos vinculados
    const assetCount = await this.prisma.asset.count({
      where: { manufacturerId: id },
    });

    if (assetCount > 0) {
      throw new ConflictException(
        `Não é possível remover o fabricante "${manufacturer.name}" pois existem ${assetCount} ativo(s) vinculado(s)`,
      );
    }

    await this.prisma.manufacturer.delete({
      where: { id },
    });

    return { message: 'Fabricante removido com sucesso' };
  }
}

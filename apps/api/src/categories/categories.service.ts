import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Verificar se já existe categoria com esse nome
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException(`Categoria com nome "${createCategoryDto.name}" já existe`);
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(params?: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params || {};

    const where: Prisma.CategoryWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
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
      this.prisma.category.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com ID "${id}" não encontrada`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Verificar se existe
    await this.findOne(id);

    // Verificar conflito de nome (se nome foi alterado)
    if (updateCategoryDto.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Categoria com nome "${updateCategoryDto.name}" já existe`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    // Verificar se existe
    const category = await this.findOne(id);

    // Verificar se tem ativos vinculados
    const assetCount = await this.prisma.asset.count({
      where: { categoryId: id },
    });

    if (assetCount > 0) {
      throw new ConflictException(
        `Não é possível remover a categoria "${category.name}" pois existem ${assetCount} ativo(s) vinculado(s)`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Categoria removida com sucesso' };
  }
}

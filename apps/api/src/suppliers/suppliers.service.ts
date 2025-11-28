import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    // Verificar se já existe fornecedor com esse nome
    const existingByName = await this.prisma.supplier.findUnique({
      where: { name: createSupplierDto.name },
    });

    if (existingByName) {
      throw new ConflictException(
        `Fornecedor com nome "${createSupplierDto.name}" já existe`,
      );
    }

    // Verificar CNPJ duplicado se fornecido
    if (createSupplierDto.cnpj) {
      const existingByCnpj = await this.prisma.supplier.findUnique({
        where: { cnpj: createSupplierDto.cnpj },
      });

      if (existingByCnpj) {
        throw new ConflictException(
          `Fornecedor com CNPJ "${createSupplierDto.cnpj}" já existe`,
        );
      }
    }

    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll(params?: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params || {};

    const where: Prisma.SupplierWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { assets: true, contracts: true },
          },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true, contracts: true },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Fornecedor com ID "${id}" não encontrado`);
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    // Verificar se existe
    await this.findOne(id);

    // Verificar conflito de nome (se nome foi alterado)
    if (updateSupplierDto.name) {
      const existing = await this.prisma.supplier.findUnique({
        where: { name: updateSupplierDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Fornecedor com nome "${updateSupplierDto.name}" já existe`,
        );
      }
    }

    // Verificar conflito de CNPJ (se CNPJ foi alterado)
    if (updateSupplierDto.cnpj) {
      const existing = await this.prisma.supplier.findUnique({
        where: { cnpj: updateSupplierDto.cnpj },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Fornecedor com CNPJ "${updateSupplierDto.cnpj}" já existe`,
        );
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string) {
    // Verificar se existe
    const supplier = await this.findOne(id);

    // Verificar se tem ativos vinculados
    const assetCount = await this.prisma.asset.count({
      where: { supplierId: id },
    });

    if (assetCount > 0) {
      throw new ConflictException(
        `Não é possível remover o fornecedor "${supplier.name}" pois existem ${assetCount} ativo(s) vinculado(s)`,
      );
    }

    // Verificar se tem contratos vinculados
    const contractCount = await this.prisma.contract.count({
      where: { supplierId: id },
    });

    if (contractCount > 0) {
      throw new ConflictException(
        `Não é possível remover o fornecedor "${supplier.name}" pois existem ${contractCount} contrato(s) vinculado(s)`,
      );
    }

    await this.prisma.supplier.delete({
      where: { id },
    });

    return { message: 'Fornecedor removido com sucesso' };
  }
}

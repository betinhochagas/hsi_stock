import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: { skip?: number; take?: number; search?: string; status?: string }) {
    const { skip = 0, take = 50, search, status } = params || {};
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          location: true,
          manufacturer: true,
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        manufacturer: true,
        supplier: true,
        assignedTo: true,
        createdBy: { select: { id: true, name: true, email: true } },
        movements: { take: 10, orderBy: { movedAt: 'desc' } },
        maintenances: { take: 10, orderBy: { reportedAt: 'desc' } },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Ativo com ID "${id}" não encontrado`);
    }

    return asset;
  }

  async create(createAssetDto: CreateAssetDto) {
    // Validar duplicidade de assetTag se fornecido
    if (createAssetDto.assetTag) {
      const existingTag = await this.prisma.asset.findUnique({
        where: { assetTag: createAssetDto.assetTag },
      });
      if (existingTag) {
        throw new ConflictException(
          `Ativo com patrimônio "${createAssetDto.assetTag}" já existe`,
        );
      }
    }

    // Validar duplicidade de serialNumber se fornecido
    if (createAssetDto.serialNumber) {
      const existingSerial = await this.prisma.asset.findFirst({
        where: { serialNumber: createAssetDto.serialNumber },
      });
      if (existingSerial) {
        throw new ConflictException(
          `Ativo com número de série "${createAssetDto.serialNumber}" já existe`,
        );
      }
    }

    // Validar que categoria existe
    const category = await this.prisma.category.findUnique({
      where: { id: createAssetDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoria com ID "${createAssetDto.categoryId}" não encontrada`,
      );
    }

    // Validar que localização existe (se fornecida)
    if (createAssetDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: createAssetDto.locationId },
      });
      if (!location) {
        throw new NotFoundException(
          `Localização com ID "${createAssetDto.locationId}" não encontrada`,
        );
      }
    }

    // Validar que fabricante existe (se fornecido)
    if (createAssetDto.manufacturerId) {
      const manufacturer = await this.prisma.manufacturer.findUnique({
        where: { id: createAssetDto.manufacturerId },
      });
      if (!manufacturer) {
        throw new NotFoundException(
          `Fabricante com ID "${createAssetDto.manufacturerId}" não encontrado`,
        );
      }
    }

    // Validar que fornecedor existe (se fornecido)
    if (createAssetDto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: createAssetDto.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(
          `Fornecedor com ID "${createAssetDto.supplierId}" não encontrado`,
        );
      }
    }

    // Validar que usuário atribuído existe (se fornecido)
    if (createAssetDto.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createAssetDto.assignedToId },
      });
      if (!user) {
        throw new NotFoundException(
          `Usuário com ID "${createAssetDto.assignedToId}" não encontrado`,
        );
      }
    }

    // Validar que usuário criador existe
    const creator = await this.prisma.user.findUnique({
      where: { id: createAssetDto.createdById },
    });
    if (!creator) {
      throw new NotFoundException(
        `Usuário criador com ID "${createAssetDto.createdById}" não encontrado`,
      );
    }

    // Criar ativo
    return this.prisma.asset.create({
      data: createAssetDto,
      include: {
        category: true,
        location: true,
        manufacturer: true,
        supplier: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    // Verificar se ativo existe
    await this.findOne(id);

    // Validar duplicidade de assetTag (se alterado)
    if (updateAssetDto.assetTag) {
      const existing = await this.prisma.asset.findUnique({
        where: { assetTag: updateAssetDto.assetTag },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ativo com patrimônio "${updateAssetDto.assetTag}" já existe`,
        );
      }
    }

    // Validar duplicidade de serialNumber (se alterado)
    if (updateAssetDto.serialNumber) {
      const existing = await this.prisma.asset.findFirst({
        where: { serialNumber: updateAssetDto.serialNumber },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ativo com número de série "${updateAssetDto.serialNumber}" já existe`,
        );
      }
    }

    // Validar relacionamentos (mesmas validações do create)
    if (updateAssetDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateAssetDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Categoria com ID "${updateAssetDto.categoryId}" não encontrada`,
        );
      }
    }

    if (updateAssetDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: updateAssetDto.locationId },
      });
      if (!location) {
        throw new NotFoundException(
          `Localização com ID "${updateAssetDto.locationId}" não encontrada`,
        );
      }
    }

    if (updateAssetDto.manufacturerId) {
      const manufacturer = await this.prisma.manufacturer.findUnique({
        where: { id: updateAssetDto.manufacturerId },
      });
      if (!manufacturer) {
        throw new NotFoundException(
          `Fabricante com ID "${updateAssetDto.manufacturerId}" não encontrado`,
        );
      }
    }

    if (updateAssetDto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: updateAssetDto.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(
          `Fornecedor com ID "${updateAssetDto.supplierId}" não encontrado`,
        );
      }
    }

    if (updateAssetDto.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateAssetDto.assignedToId },
      });
      if (!user) {
        throw new NotFoundException(
          `Usuário com ID "${updateAssetDto.assignedToId}" não encontrado`,
        );
      }
    }

    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
      include: {
        category: true,
        location: true,
        manufacturer: true,
        supplier: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(id: string) {
    // Verificar se existe
    const asset = await this.findOne(id);

    // Verificar vínculos com movimentações
    const movementCount = await this.prisma.movement.count({
      where: { assetId: id },
    });

    if (movementCount > 0) {
      throw new ConflictException(
        `Não é possível remover o ativo "${asset.name}" pois existem ${movementCount} movimentação(ões) vinculada(s). Considere alterá-lo para status DESCARTADO ao invés de removê-lo.`,
      );
    }

    // Verificar vínculos com manutenções
    const maintenanceCount = await this.prisma.maintenance.count({
      where: { assetId: id },
    });

    if (maintenanceCount > 0) {
      throw new ConflictException(
        `Não é possível remover o ativo "${asset.name}" pois existem ${maintenanceCount} manutenção(ões) vinculada(s).`,
      );
    }

    // Verificar vínculos com contratos
    const assetWithContracts = await this.prisma.asset.findUnique({
      where: { id },
      include: { contracts: true },
    });

    if (assetWithContracts?.contracts && assetWithContracts.contracts.length > 0) {
      throw new ConflictException(
        `Não é possível remover o ativo "${asset.name}" pois existem ${assetWithContracts.contracts.length} contrato(s) vinculado(s).`,
      );
    }

    await this.prisma.asset.delete({
      where: { id },
    });

    return { 
      message: 'Ativo removido com sucesso',
      deletedAsset: {
        id: asset.id,
        name: asset.name,
        assetTag: asset.assetTag,
      },
    };
  }
}

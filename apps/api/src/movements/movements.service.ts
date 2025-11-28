import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementType, AssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  async create(createMovementDto: CreateMovementDto) {
    // Validar se ativo existe
    const asset = await this.prisma.asset.findUnique({
      where: { id: createMovementDto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Ativo não encontrado');
    }

    // Validar se usuário existe (se fornecido)
    if (createMovementDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createMovementDto.userId },
      });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
    }

    // Validar localização de origem se fornecida
    if (createMovementDto.fromLocationId) {
      const fromLocation = await this.prisma.location.findUnique({
        where: { id: createMovementDto.fromLocationId },
      });
      if (!fromLocation) {
        throw new NotFoundException('Localização de origem não encontrada');
      }
    }

    // Validar regras de negócio por tipo
    this.validateMovementRules(createMovementDto);

    // Criar movimentação
    const movement = await this.prisma.movement.create({
      data: {
        type: createMovementDto.type,
        assetId: createMovementDto.assetId,
        userId: createMovementDto.userId,
        fromLocationId: createMovementDto.fromLocationId,
        toLocation: createMovementDto.toLocation,
        reason: createMovementDto.reason,
        ticketNumber: createMovementDto.ticketNumber,
        movedBy: createMovementDto.movedBy,
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetTag: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        fromLocation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Atualizar status do ativo baseado no tipo de movimentação
    await this.updateAssetAfterMovement(createMovementDto);

    return {
      message: 'Movimentação registrada com sucesso',
      movement,
    };
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    assetId?: string;
    userId?: string;
    type?: MovementType;
    startDate?: string;
    endDate?: string;
  }) {
    const { skip = 0, take = 50, assetId, userId, type, startDate, endDate } = params || {};

    const where: Prisma.MovementWhereInput = {};

    if (assetId) {
      where.assetId = assetId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.movedAt = {};
      if (startDate) {
        where.movedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.movedAt.lte = new Date(endDate);
      }
    }

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        skip,
        take,
        orderBy: { movedAt: 'desc' },
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              assetTag: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          fromLocation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.movement.count({ where }),
    ]);

    return {
      data: movements,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const movement = await this.prisma.movement.findUnique({
      where: { id },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetTag: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        fromLocation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!movement) {
      throw new NotFoundException('Movimentação não encontrada');
    }

    return movement;
  }

  async findByAsset(assetId: string, params?: { skip?: number; take?: number }) {
    const { skip = 0, take = 50 } = params || {};

    // Verificar se ativo existe
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Ativo não encontrado');
    }

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where: { assetId },
        skip,
        take,
        orderBy: { movedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          fromLocation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.movement.count({ where: { assetId } }),
    ]);

    return {
      data: movements,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findByUser(userId: string, params?: { skip?: number; take?: number }) {
    const { skip = 0, take = 50 } = params || {};

    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { movedAt: 'desc' },
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              assetTag: true,
              status: true,
            },
          },
          fromLocation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.movement.count({ where: { userId } }),
    ]);

    return {
      data: movements,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  private validateMovementRules(dto: CreateMovementDto) {
    switch (dto.type) {
      case MovementType.CHECK_OUT:
        if (!dto.toLocation && !dto.userId) {
          throw new BadRequestException(
            'CHECK_OUT requer localização de destino ou usuário responsável',
          );
        }
        break;

      case MovementType.CHECK_IN:
        if (!dto.toLocation) {
          throw new BadRequestException('CHECK_IN requer localização de destino');
        }
        break;

      case MovementType.TRANSFER:
        if (!dto.fromLocationId || !dto.toLocation) {
          throw new BadRequestException(
            'TRANSFER requer localização de origem e destino',
          );
        }
        break;

      case MovementType.ASSIGNMENT:
        if (!dto.userId) {
          throw new BadRequestException('ASSIGNMENT requer usuário responsável');
        }
        break;

      case MovementType.RETURN:
        if (!dto.toLocation) {
          throw new BadRequestException('RETURN requer localização de destino');
        }
        break;
    }
  }

  private async updateAssetAfterMovement(dto: CreateMovementDto) {
    const updateData: { status?: AssetStatus; assignedToId?: string | null } = {};

    // Atualizar status baseado no tipo de movimentação
    switch (dto.type) {
      case MovementType.CHECK_OUT:
        updateData.status = AssetStatus.EM_USO;
        if (dto.userId) {
          updateData.assignedToId = dto.userId;
        }
        break;

      case MovementType.CHECK_IN:
        updateData.status = AssetStatus.EM_ESTOQUE;
        updateData.assignedToId = null;
        break;

      case MovementType.ASSIGNMENT:
        updateData.status = AssetStatus.EM_USO;
        if (dto.userId) {
          updateData.assignedToId = dto.userId;
        }
        break;

      case MovementType.RETURN:
        updateData.status = AssetStatus.EM_ESTOQUE;
        updateData.assignedToId = null;
        break;

      case MovementType.TRANSFER:
        // Mantém status atual, apenas registra a movimentação
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.asset.update({
        where: { id: dto.assetId },
        data: updateData,
      });
    }
  }
}

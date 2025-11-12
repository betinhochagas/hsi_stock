import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { AssignLicenseDto } from './dto/assign-license.dto';
import { LicenseStatus } from '@prisma/client';

@Injectable()
export class LicensesService {
  constructor(private prisma: PrismaService) {}

  async create(createLicenseDto: CreateLicenseDto) {
    // Validar datas
    const purchaseDate = new Date(createLicenseDto.purchaseDate);
    const expirationDate = new Date(createLicenseDto.expirationDate);

    if (expirationDate <= purchaseDate) {
      throw new BadRequestException('Data de expiração deve ser posterior à data de compra');
    }

    const license = await this.prisma.license.create({
      data: {
        name: createLicenseDto.name,
        licenseKey: createLicenseDto.licenseKey,
        totalSeats: createLicenseDto.totalSeats,
        usedSeats: 0,
        purchaseDate,
        expirationDate,
        cost: createLicenseDto.cost,
        vendor: createLicenseDto.vendor,
        notes: createLicenseDto.notes,
        status: this.calculateStatus(expirationDate),
      },
      include: {
        assignments: true,
      },
    });

    return {
      message: 'Licença criada com sucesso',
      license,
    };
  }

  async findAll(params?: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params || {};

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { licenseKey: { contains: search, mode: 'insensitive' as const } },
            { vendor: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [licenses, total] = await Promise.all([
      this.prisma.license.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          assignments: true,
          _count: {
            select: {
              assignments: true,
            },
          },
        },
      }),
      this.prisma.license.count({ where }),
    ]);

    return {
      data: licenses,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const license = await this.prisma.license.findUnique({
      where: { id },
      include: {
        assignments: {
          orderBy: { assignedAt: 'desc' },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    if (!license) {
      throw new NotFoundException('Licença não encontrada');
    }

    return license;
  }

  async update(id: string, updateLicenseDto: UpdateLicenseDto) {
    const existingLicense = await this.prisma.license.findUnique({
      where: { id },
      include: {
        assignments: true,
      },
    });

    if (!existingLicense) {
      throw new NotFoundException('Licença não encontrada');
    }

    // Validar se está tentando reduzir totalSeats abaixo de usedSeats
    if (updateLicenseDto.totalSeats !== undefined && updateLicenseDto.totalSeats < existingLicense.usedSeats) {
      throw new ConflictException(
        `Não é possível reduzir total de seats para ${updateLicenseDto.totalSeats} pois ${existingLicense.usedSeats} seats já estão em uso`,
      );
    }

    // Validar datas se fornecidas
    let status = existingLicense.status;
    if (updateLicenseDto.expirationDate) {
      const expirationDate = new Date(updateLicenseDto.expirationDate);
      const purchaseDate = updateLicenseDto.purchaseDate
        ? new Date(updateLicenseDto.purchaseDate)
        : existingLicense.purchaseDate;

      if (purchaseDate && expirationDate <= purchaseDate) {
        throw new BadRequestException('Data de expiração deve ser posterior à data de compra');
      }

      status = this.calculateStatus(expirationDate);
    }

    const license = await this.prisma.license.update({
      where: { id },
      data: {
        ...updateLicenseDto,
        status,
        purchaseDate: updateLicenseDto.purchaseDate
          ? new Date(updateLicenseDto.purchaseDate)
          : undefined,
        expirationDate: updateLicenseDto.expirationDate
          ? new Date(updateLicenseDto.expirationDate)
          : undefined,
      },
      include: {
        assignments: true,
      },
    });

    return {
      message: 'Licença atualizada com sucesso',
      license,
    };
  }

  async remove(id: string) {
    const license = await this.prisma.license.findUnique({
      where: { id },
      include: {
        assignments: true,
      },
    });

    if (!license) {
      throw new NotFoundException('Licença não encontrada');
    }

    if (license.assignments.length > 0) {
      throw new ConflictException(
        `Não é possível remover esta licença pois existem ${license.assignments.length} atribuições ativas. Revogue todas as atribuições primeiro.`,
      );
    }

    await this.prisma.license.delete({
      where: { id },
    });

    return {
      message: 'Licença removida com sucesso',
    };
  }

  async assign(licenseId: string, assignDto: AssignLicenseDto) {
    const license = await this.prisma.license.findUnique({
      where: { id: licenseId },
      include: {
        assignments: true,
      },
    });

    if (!license) {
      throw new NotFoundException('Licença não encontrada');
    }

    // Validar se há seats disponíveis
    if (license.usedSeats >= license.totalSeats) {
      throw new ConflictException(
        `Todos os seats desta licença já estão em uso (${license.usedSeats}/${license.totalSeats})`,
      );
    }

    // Validar se pelo menos um campo foi fornecido
    if (!assignDto.deviceName && !assignDto.userName && !assignDto.email) {
      throw new BadRequestException('Deve ser fornecido pelo menos deviceName, userName ou email');
    }

    // Criar atribuição
    const assignment = await this.prisma.licenseAssignment.create({
      data: {
        licenseId,
        deviceName: assignDto.deviceName,
        userName: assignDto.userName,
        email: assignDto.email,
      },
      include: {
        license: true,
      },
    });

    // Atualizar usedSeats
    await this.prisma.license.update({
      where: { id: licenseId },
      data: {
        usedSeats: license.usedSeats + 1,
      },
    });

    return {
      message: 'Licença atribuída com sucesso',
      assignment,
    };
  }

  async revoke(licenseId: string, assignmentId: string) {
    const assignment = await this.prisma.licenseAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        license: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Atribuição não encontrada');
    }

    if (assignment.licenseId !== licenseId) {
      throw new ConflictException('Esta atribuição não pertence à licença especificada');
    }

    await this.prisma.licenseAssignment.delete({
      where: { id: assignmentId },
    });

    // Atualizar usedSeats
    await this.prisma.license.update({
      where: { id: licenseId },
      data: {
        usedSeats: Math.max(0, assignment.license.usedSeats - 1),
      },
    });

    return {
      message: 'Atribuição revogada com sucesso',
    };
  }

  async findExpiring(days: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const licenses = await this.prisma.license.findMany({
      where: {
        expirationDate: {
          gte: now,
          lte: futureDate,
        },
        status: {
          in: [LicenseStatus.ATIVA],
        },
      },
      include: {
        assignments: true,
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: { expirationDate: 'asc' },
    });

    return {
      data: licenses,
      count: licenses.length,
      expiringIn: `${days} dias`,
    };
  }

  private calculateStatus(expirationDate: Date): LicenseStatus {
    const now = new Date();
    
    if (expirationDate < now) {
      return LicenseStatus.EXPIRADA;
    }
    
    return LicenseStatus.ATIVA;
  }
}

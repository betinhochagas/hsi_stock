import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        manufacturer: true,
        supplier: true,
        assignedTo: true,
        movements: { take: 10, orderBy: { movedAt: 'desc' } },
        maintenances: { take: 10, orderBy: { reportedAt: 'desc' } },
      },
    });
  }
}

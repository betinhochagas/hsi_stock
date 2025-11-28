import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addDays, format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export interface DashboardMetrics {
  overview: {
    totalAssets: number;
    totalValue: number;
    activeUsers: number;
    totalMovements: number;
  };
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
    value: number;
  }>;
  byLocation: Array<{
    location: string;
    count: number;
    percentage: number;
    value: number;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    month: string;
    acquisitions: number;
    movements: number;
    value: number;
  }>;
}

export interface AssetsByCategoryReport {
  categories: Array<{
    id: string;
    name: string;
    count: number;
    percentage: number;
    totalValue: number;
    averageValue: number;
  }>;
  total: number;
}

export interface AssetsByLocationReport {
  locations: Array<{
    id: string;
    name: string;
    count: number;
    percentage: number;
    totalValue: number;
    inUse: number;
    available: number;
  }>;
  total: number;
}

export interface LicensesExpiringReport {
  expiringSoon: Array<{
    id: string;
    softwareName: string;
    expiryDate: string;
    daysUntilExpiry: number;
    totalSeats: number;
    usedSeats: number;
    cost: number;
    severity: 'critical' | 'warning' | 'info';
  }>;
  summary: {
    critical: number;
    warning: number;
    info: number;
    totalValue: number;
  };
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [
      totalAssets,
      assetsByCategory,
      assetsByLocation,
      assetsByStatus,
      totalMovements,
      activeUsers,
    ] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.groupBy({
        by: ['categoryId'],
        _count: { id: true },
        _sum: { purchasePrice: true },
      }),
      this.prisma.asset.groupBy({
        by: ['locationId'],
        _count: { id: true },
        _sum: { purchasePrice: true },
      }),
      this.prisma.asset.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.movement.count(),
      this.prisma.user.count({ where: { active: true } }),
    ]);

    const totalValue = await this.prisma.asset.aggregate({
      _sum: { purchasePrice: true },
    });

    // Get category names
    const categoryIds = assetsByCategory.map((c) => c.categoryId).filter(Boolean);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds as string[] } },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    // Get location names
    const locationIds = assetsByLocation.map((l) => l.locationId).filter(Boolean);
    const locations = await this.prisma.location.findMany({
      where: { id: { in: locationIds as string[] } },
    });
    const locationMap = new Map(locations.map((l) => [l.id, l.name]));

    // Calculate trends (last 6 months)
    const trends = await this.calculateTrends();

    return {
      overview: {
        totalAssets,
        totalValue: totalValue._sum.purchasePrice?.toNumber() || 0,
        activeUsers,
        totalMovements,
      },
      byCategory: assetsByCategory.map((item) => ({
        category: item.categoryId ? categoryMap.get(item.categoryId) || 'Sem Categoria' : 'Sem Categoria',
        count: item._count.id,
        percentage: (item._count.id / totalAssets) * 100,
        value: item._sum.purchasePrice?.toNumber() || 0,
      })),
      byLocation: assetsByLocation.map((item) => ({
        location: item.locationId ? locationMap.get(item.locationId) || 'Sem Localização' : 'Sem Localização',
        count: item._count.id,
        percentage: (item._count.id / totalAssets) * 100,
        value: item._sum.purchasePrice?.toNumber() || 0,
      })),
      byStatus: assetsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
        percentage: (item._count.id / totalAssets) * 100,
      })),
      trends,
    };
  }

  async getAssetsByCategory(): Promise<AssetsByCategoryReport> {
    const total = await this.prisma.asset.count();

    const grouped = await this.prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      _sum: { purchasePrice: true },
    });

    const categoryIds = grouped.map((g) => g.categoryId).filter(Boolean);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds as string[] } },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return {
      categories: grouped.map((item) => {
        const category = item.categoryId ? categoryMap.get(item.categoryId) : null;
        const count = item._count.id;
        const totalValue = item._sum.purchasePrice?.toNumber() || 0;

        return {
          id: item.categoryId || 'null',
          name: category?.name || 'Sem Categoria',
          count,
          percentage: (count / total) * 100,
          totalValue,
          averageValue: count > 0 ? totalValue / count : 0,
        };
      }).sort((a, b) => b.count - a.count),
      total,
    };
  }

  async getAssetsByLocation(): Promise<AssetsByLocationReport> {
    const total = await this.prisma.asset.count();

    const grouped = await this.prisma.asset.groupBy({
      by: ['locationId', 'status'],
      _count: { id: true },
      _sum: { purchasePrice: true },
    });

    const locationIds = grouped.map((g) => g.locationId).filter(Boolean);
    const locations = await this.prisma.location.findMany({
      where: { id: { in: locationIds as string[] } },
    });

    const locationMap = new Map(locations.map((l) => [l.id, l]));

    // Aggregate by location
    const locationData = new Map<string, {
      count: number;
      value: number;
      inUse: number;
      available: number;
    }>();

    grouped.forEach((item) => {
      const locId = item.locationId || 'null';
      const current = locationData.get(locId) || { count: 0, value: 0, inUse: 0, available: 0 };
      
      current.count += item._count.id;
      current.value += item._sum.purchasePrice?.toNumber() || 0;
      
      if (item.status === 'EM_USO') {
        current.inUse += item._count.id;
      } else if (item.status === 'EM_ESTOQUE') {
        current.available += item._count.id;
      }

      locationData.set(locId, current);
    });

    return {
      locations: Array.from(locationData.entries()).map(([id, data]) => {
        const location = id !== 'null' ? locationMap.get(id) : null;
        
        return {
          id,
          name: location?.name || 'Sem Localização',
          count: data.count,
          percentage: (data.count / total) * 100,
          totalValue: data.value,
          inUse: data.inUse,
          available: data.available,
        };
      }).sort((a, b) => b.count - a.count),
      total,
    };
  }

  async getLicensesExpiring(days: number = 90): Promise<LicensesExpiringReport> {
    const today = new Date();
    const futureDate = addDays(today, days);

    const licenses = await this.prisma.license.findMany({
      where: {
        expirationDate: {
          gte: today,
          lte: futureDate,
        },
        status: 'ATIVA',
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });

    const expiringSoon = licenses.map((license) => {
      const expiryDate = new Date(license.expirationDate!);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let severity: 'critical' | 'warning' | 'info';
      if (daysUntilExpiry <= 30) {
        severity = 'critical';
      } else if (daysUntilExpiry <= 60) {
        severity = 'warning';
      } else {
        severity = 'info';
      }

      return {
        id: license.id,
        softwareName: license.name,
        expiryDate: license.expirationDate!.toISOString(),
        daysUntilExpiry,
        totalSeats: license.totalSeats,
        usedSeats: license.usedSeats,
        cost: license.cost?.toNumber() || 0,
        severity,
      };
    });

    const summary = {
      critical: expiringSoon.filter((l) => l.severity === 'critical').length,
      warning: expiringSoon.filter((l) => l.severity === 'warning').length,
      info: expiringSoon.filter((l) => l.severity === 'info').length,
      totalValue: expiringSoon.reduce((sum, l) => sum + l.cost, 0),
    };

    return { expiringSoon, summary };
  }

  private async calculateTrends() {
    const trends = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const [acquisitions, movements, valueAgg] = await Promise.all([
        this.prisma.asset.count({
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        }),
        this.prisma.movement.count({
          where: {
            movedAt: {
              gte: start,
              lte: end,
            },
          },
        }),
        this.prisma.asset.aggregate({
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
          _sum: { purchasePrice: true },
        }),
      ]);

      trends.push({
        month: format(date, 'MMM yyyy'),
        acquisitions,
        movements,
        value: valueAgg._sum.purchasePrice?.toNumber() || 0,
      });
    }

    return trends;
  }
}

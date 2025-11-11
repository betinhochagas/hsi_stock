import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check do sistema' })
  async check() {
    const dbHealthy = await this.checkDatabase();
    
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Métricas básicas do sistema' })
  async metrics() {
    const [
      totalAssets,
      totalUsers,
      totalLicenses,
      totalCategories,
    ] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.user.count(),
      this.prisma.license.count(),
      this.prisma.category.count(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      counts: {
        assets: totalAssets,
        users: totalUsers,
        licenses: totalLicenses,
        categories: totalCategories,
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard-metrics')
  @ApiOperation({ summary: 'Obter métricas agregadas do dashboard' })
  @ApiResponse({ status: 200, description: 'Métricas retornadas com sucesso' })
  async getDashboardMetrics() {
    return this.reportsService.getDashboardMetrics();
  }

  @Get('assets-by-category')
  @ApiOperation({ summary: 'Relatório de ativos por categoria' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso' })
  async getAssetsByCategory() {
    return this.reportsService.getAssetsByCategory();
  }

  @Get('assets-by-location')
  @ApiOperation({ summary: 'Relatório de ativos por localização' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso' })
  async getAssetsByLocation() {
    return this.reportsService.getAssetsByLocation();
  }

  @Get('licenses-expiring')
  @ApiOperation({ summary: 'Relatório de licenças expirando' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Dias até expiração (padrão: 90)' })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso' })
  async getLicensesExpiring(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 90;
    return this.reportsService.getLicensesExpiring(daysNum);
  }
}

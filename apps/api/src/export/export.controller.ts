import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('assets')
  @ApiOperation({ summary: 'Exportar ativos em CSV ou XLSX' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false, description: 'Formato de exportação (padrão: xlsx)' })
  @ApiResponse({ status: 200, description: 'Arquivo exportado com sucesso' })
  async exportAssets(
    @Query('format') format: 'csv' | 'xlsx' = 'xlsx',
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportAssets(format);
    const filename = `assets_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    
    res.set({
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Exportar movimentações em CSV ou XLSX' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false, description: 'Formato de exportação (padrão: xlsx)' })
  @ApiResponse({ status: 200, description: 'Arquivo exportado com sucesso' })
  async exportMovements(
    @Query('format') format: 'csv' | 'xlsx' = 'xlsx',
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportMovements(format);
    const filename = `movements_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    
    res.set({
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }

  @Get('report/by-category')
  @ApiOperation({ summary: 'Exportar relatório por categoria' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false, description: 'Formato de exportação (padrão: xlsx)' })
  @ApiResponse({ status: 200, description: 'Arquivo exportado com sucesso' })
  async exportReportByCategory(
    @Query('format') format: 'csv' | 'xlsx' = 'xlsx',
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportReportByCategory(format);
    const filename = `report_by_category_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    
    res.set({
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }

  @Get('report/by-location')
  @ApiOperation({ summary: 'Exportar relatório por localização' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false, description: 'Formato de exportação (padrão: xlsx)' })
  @ApiResponse({ status: 200, description: 'Arquivo exportado com sucesso' })
  async exportReportByLocation(
    @Query('format') format: 'csv' | 'xlsx' = 'xlsx',
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportReportByLocation(format);
    const filename = `report_by_location_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    
    res.set({
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }

  @Get('report/dashboard')
  @ApiOperation({ summary: 'Exportar métricas do dashboard' })
  @ApiQuery({ name: 'format', enum: ['csv', 'xlsx'], required: false, description: 'Formato de exportação (padrão: xlsx)' })
  @ApiResponse({ status: 200, description: 'Arquivo exportado com sucesso' })
  async exportDashboardMetrics(
    @Query('format') format: 'csv' | 'xlsx' = 'xlsx',
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportDashboardMetrics(format);
    const filename = `dashboard_metrics_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
    
    res.set({
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  }
}

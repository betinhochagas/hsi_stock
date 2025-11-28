import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportAssets(format: 'csv' | 'xlsx'): Promise<Buffer> {
    const assets = await this.prisma.asset.findMany({
      include: {
        category: true,
        location: true,
        manufacturer: true,
        supplier: true,
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assets');

    // Add headers
    worksheet.columns = [
      { header: 'Código', key: 'assetCode', width: 15 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Localização', key: 'location', width: 20 },
      { header: 'Fabricante', key: 'manufacturer', width: 20 },
      { header: 'Fornecedor', key: 'supplier', width: 20 },
      { header: 'Nº Série', key: 'serialNumber', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Atribuído a', key: 'assignedTo', width: 25 },
      { header: 'Preço Compra', key: 'purchasePrice', width: 15 },
      { header: 'Data Compra', key: 'purchaseDate', width: 15 },
      { header: 'Descrição', key: 'description', width: 40 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data
    assets.forEach((asset) => {
      worksheet.addRow({
        assetCode: asset.assetTag || '-',
        name: asset.name,
        category: asset.category?.name || '-',
        location: asset.location?.name || '-',
        manufacturer: asset.manufacturer?.name || '-',
        supplier: asset.supplier?.name || '-',
        serialNumber: asset.serialNumber || '-',
        status: this.translateStatus(asset.status),
        assignedTo: asset.assignedTo?.name || '-',
        purchasePrice: asset.purchasePrice?.toNumber() || 0,
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('pt-BR') : '-',
        description: asset.description || '-',
      });
    });

    // Auto-filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 12 },
    };

    if (format === 'csv') {
      return Buffer.from(await workbook.csv.writeBuffer());
    } else {
      return Buffer.from(await workbook.xlsx.writeBuffer());
    }
  }

  async exportMovements(format: 'csv' | 'xlsx'): Promise<Buffer> {
    const movements = await this.prisma.movement.findMany({
      include: {
        asset: true,
        fromLocation: true,
        user: true,
      },
      orderBy: { movedAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Movements');

    // Add headers
    worksheet.columns = [
      { header: 'Data', key: 'movedAt', width: 20 },
      { header: 'Ativo', key: 'asset', width: 30 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'De', key: 'fromLocation', width: 20 },
      { header: 'Para', key: 'toLocation', width: 20 },
      { header: 'Quantidade', key: 'quantity', width: 12 },
      { header: 'Movido Por', key: 'movedBy', width: 25 },
      { header: 'Observações', key: 'notes', width: 40 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data
    movements.forEach((movement) => {
      worksheet.addRow({
        movedAt: new Date(movement.movedAt).toLocaleString('pt-BR'),
        asset: movement.asset?.name || '-',
        type: this.translateMovementType(movement.type),
        fromLocation: movement.fromLocation?.name || '-',
        toLocation: movement.toLocation || '-',
        quantity: 1,
        movedBy: movement.movedBy || movement.user?.name || '-',
        notes: movement.reason || '-',
      });
    });

    // Auto-filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 8 },
    };

    if (format === 'csv') {
      return Buffer.from(await workbook.csv.writeBuffer());
    } else {
      return Buffer.from(await workbook.xlsx.writeBuffer());
    }
  }

  async exportReportByCategory(format: 'csv' | 'xlsx'): Promise<Buffer> {
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assets by Category');

    // Add headers
    worksheet.columns = [
      { header: 'Categoria', key: 'category', width: 30 },
      { header: 'Quantidade', key: 'count', width: 15 },
      { header: 'Percentual', key: 'percentage', width: 15 },
      { header: 'Valor Total', key: 'totalValue', width: 18 },
      { header: 'Valor Médio', key: 'averageValue', width: 18 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data
    const data = grouped.map((item) => {
      const category = item.categoryId ? categoryMap.get(item.categoryId) : null;
      const count = item._count.id;
      const totalValue = item._sum.purchasePrice?.toNumber() || 0;

      return {
        category: category?.name || 'Sem Categoria',
        count,
        percentage: ((count / total) * 100).toFixed(2) + '%',
        totalValue,
        averageValue: count > 0 ? totalValue / count : 0,
      };
    }).sort((a, b) => b.count - a.count);

    data.forEach((row) => worksheet.addRow(row));

    // Add total row
    const totalRow = worksheet.addRow({
      category: 'TOTAL',
      count: total,
      percentage: '100%',
      totalValue: data.reduce((sum, r) => sum + r.totalValue, 0),
      averageValue: '',
    });
    totalRow.font = { bold: true };

    if (format === 'csv') {
      return Buffer.from(await workbook.csv.writeBuffer());
    } else {
      return Buffer.from(await workbook.xlsx.writeBuffer());
    }
  }

  async exportReportByLocation(format: 'csv' | 'xlsx'): Promise<Buffer> {
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assets by Location');

    // Add headers
    worksheet.columns = [
      { header: 'Localização', key: 'location', width: 30 },
      { header: 'Quantidade', key: 'count', width: 15 },
      { header: 'Percentual', key: 'percentage', width: 15 },
      { header: 'Valor Total', key: 'totalValue', width: 18 },
      { header: 'Em Uso', key: 'inUse', width: 12 },
      { header: 'Disponível', key: 'available', width: 12 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add data
    const data = Array.from(locationData.entries()).map(([id, data]) => {
      const location = id !== 'null' ? locationMap.get(id) : null;
      
      return {
        location: location?.name || 'Sem Localização',
        count: data.count,
        percentage: ((data.count / total) * 100).toFixed(2) + '%',
        totalValue: data.value,
        inUse: data.inUse,
        available: data.available,
      };
    }).sort((a, b) => b.count - a.count);

    data.forEach((row) => worksheet.addRow(row));

    // Add total row
    const totalRow = worksheet.addRow({
      location: 'TOTAL',
      count: total,
      percentage: '100%',
      totalValue: data.reduce((sum, r) => sum + r.totalValue, 0),
      inUse: data.reduce((sum, r) => sum + r.inUse, 0),
      available: data.reduce((sum, r) => sum + r.available, 0),
    });
    totalRow.font = { bold: true };

    if (format === 'csv') {
      return Buffer.from(await workbook.csv.writeBuffer());
    } else {
      return Buffer.from(await workbook.xlsx.writeBuffer());
    }
  }

  async exportDashboardMetrics(format: 'csv' | 'xlsx'): Promise<Buffer> {
    // Get overview data
    const [totalAssets, totalMovements, activeUsers] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.movement.count(),
      this.prisma.user.count({ where: { active: true } }),
    ]);

    const totalValue = await this.prisma.asset.aggregate({
      _sum: { purchasePrice: true },
    });

    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Overview
    const overviewSheet = workbook.addWorksheet('Overview');
    overviewSheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];
    
    overviewSheet.getRow(1).font = { bold: true };
    overviewSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    overviewSheet.addRow({ metric: 'Total de Ativos', value: totalAssets });
    overviewSheet.addRow({ metric: 'Valor Total', value: totalValue._sum.purchasePrice?.toNumber() || 0 });
    overviewSheet.addRow({ metric: 'Usuários Ativos', value: activeUsers });
    overviewSheet.addRow({ metric: 'Total de Movimentações', value: totalMovements });

    // Sheet 2: By Status
    const statusSheet = workbook.addWorksheet('By Status');
    const statusData = await this.prisma.asset.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    statusSheet.columns = [
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Quantidade', key: 'count', width: 15 },
      { header: 'Percentual', key: 'percentage', width: 15 },
    ];

    statusSheet.getRow(1).font = { bold: true };
    statusSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    statusData.forEach((item) => {
      statusSheet.addRow({
        status: this.translateStatus(item.status),
        count: item._count.id,
        percentage: ((item._count.id / totalAssets) * 100).toFixed(2) + '%',
      });
    });

    if (format === 'csv') {
      return Buffer.from(await workbook.csv.writeBuffer());
    } else {
      return Buffer.from(await workbook.xlsx.writeBuffer());
    }
  }

  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      EM_ESTOQUE: 'Em Estoque',
      EM_USO: 'Em Uso',
      MANUTENCAO: 'Manutenção',
      DESCARTADO: 'Descartado',
      PERDIDO: 'Perdido',
    };
    return statusMap[status] || status;
  }

  private translateMovementType(type: string): string {
    const typeMap: Record<string, string> = {
      ENTRADA: 'Entrada',
      SAIDA: 'Saída',
      TRANSFERENCIA: 'Transferência',
      MANUTENCAO: 'Manutenção',
      DESCARTE: 'Descarte',
    };
    return typeMap[type] || type;
  }
}

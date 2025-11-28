import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from './export.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient } from '../test/setup';
import * as ExcelJS from 'exceljs';

describe('ExportService', () => {
  let service: ExportService;
  let prisma: any;

  const mockDecimal = (value: number) => ({ toNumber: () => value });

  beforeEach(async () => {
    prisma = mockPrismaClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportAssets', () => {
    it('should export assets to XLSX format', async () => {
      const mockAssets = [
        {
          id: 'asset-1',
          assetTag: 'A001',
          name: 'Laptop Dell',
          status: 'EM_USO',
          serialNumber: 'SN123',
          purchasePrice: mockDecimal(3500),
          purchaseDate: new Date('2024-01-15'),
          description: 'i7 8GB RAM',
          category: { name: 'Laptops' },
          location: { name: 'Office' },
          manufacturer: { name: 'Dell' },
          supplier: { name: 'Tech Corp' },
          assignedTo: { name: 'John Doe' },
        },
      ];

      prisma.asset.findMany.mockResolvedValue(mockAssets);

      const result = await service.exportAssets('xlsx');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
          location: true,
          manufacturer: true,
          supplier: true,
          assignedTo: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Verify Excel structure by reading buffer
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(result as any);
      
      const worksheet = workbook.getWorksheet('Assets');
      expect(worksheet).toBeDefined();
      expect(worksheet?.rowCount).toBeGreaterThan(1); // Header + data
    });

    it('should export assets to CSV format', async () => {
      prisma.asset.findMany.mockResolvedValue([]);

      const result = await service.exportAssets('csv');

      expect(result).toBeInstanceOf(Buffer);
      expect(prisma.asset.findMany).toHaveBeenCalled();
    });

    it('should handle assets with null values', async () => {
      const mockAssets = [
        {
          id: 'asset-1',
          assetTag: null,
          name: 'Test Asset',
          status: 'EM_ESTOQUE',
          serialNumber: null,
          purchasePrice: null,
          purchaseDate: null,
          description: null,
          category: null,
          location: null,
          manufacturer: null,
          supplier: null,
          assignedTo: null,
        },
      ];

      prisma.asset.findMany.mockResolvedValue(mockAssets);

      const result = await service.exportAssets('xlsx');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('exportMovements', () => {
    it('should export movements to XLSX format', async () => {
      const mockMovements = [
        {
          id: 'mov-1',
          movedAt: new Date('2024-01-15'),
          type: 'TRANSFERENCIA',
          toLocation: 'Warehouse',
          quantity: 1,
          reason: 'Inventory transfer',
          movedBy: 'Admin',
          asset: { name: 'Laptop Dell' },
          fromLocation: { name: 'Office' },
          user: { name: 'John Doe' },
        },
      ];

      prisma.movement.findMany.mockResolvedValue(mockMovements);

      const result = await service.exportMovements('xlsx');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
      expect(prisma.movement.findMany).toHaveBeenCalledWith({
        include: {
          asset: true,
          fromLocation: true,
          user: true,
        },
        orderBy: { movedAt: 'desc' },
      });
    });

    it('should export movements to CSV format', async () => {
      prisma.movement.findMany.mockResolvedValue([]);

      const result = await service.exportMovements('csv');

      expect(result).toBeInstanceOf(Buffer);
      expect(prisma.movement.findMany).toHaveBeenCalled();
    });
  });

  describe('exportReportByCategory', () => {
    it('should export category report with aggregations', async () => {
      prisma.asset.count.mockResolvedValue(100);
      prisma.asset.groupBy.mockResolvedValue([
        { categoryId: 'cat-1', _count: { id: 60 }, _sum: { purchasePrice: mockDecimal(120000) } },
        { categoryId: 'cat-2', _count: { id: 40 }, _sum: { purchasePrice: mockDecimal(80000) } },
      ]);
      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Laptops' },
        { id: 'cat-2', name: 'Monitors' },
      ]);

      const result = await service.exportReportByCategory('xlsx');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // Verify Excel structure
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(result as any);
      
      const worksheet = workbook.getWorksheet('Assets by Category');
      expect(worksheet).toBeDefined();
      expect(worksheet?.rowCount).toBe(4); // Header + 2 categories + total row
    });

    it('should export to CSV format', async () => {
      prisma.asset.count.mockResolvedValue(10);
      prisma.asset.groupBy.mockResolvedValue([]);
      prisma.category.findMany.mockResolvedValue([]);

      const result = await service.exportReportByCategory('csv');

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('exportReportByLocation', () => {
    it('should export location report with status breakdown', async () => {
      prisma.asset.count.mockResolvedValue(100);
      prisma.asset.groupBy.mockResolvedValue([
        { locationId: 'loc-1', status: 'EM_USO', _count: { id: 30 }, _sum: { purchasePrice: mockDecimal(30000) } },
        { locationId: 'loc-1', status: 'EM_ESTOQUE', _count: { id: 20 }, _sum: { purchasePrice: mockDecimal(20000) } },
      ]);
      prisma.location.findMany.mockResolvedValue([
        { id: 'loc-1', name: 'Warehouse' },
      ]);

      const result = await service.exportReportByLocation('xlsx');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // Verify Excel structure
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(result as any);
      
      const worksheet = workbook.getWorksheet('Assets by Location');
      expect(worksheet).toBeDefined();
      expect(worksheet?.rowCount).toBe(3); // 1 location + total row + header
    });

    it('should export to CSV format', async () => {
      prisma.asset.count.mockResolvedValue(0);
      prisma.asset.groupBy.mockResolvedValue([]);
      prisma.location.findMany.mockResolvedValue([]);

      const result = await service.exportReportByLocation('csv');

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('exportDashboardMetrics', () => {
    it('should export dashboard metrics with multiple sheets', async () => {
      prisma.asset.count.mockResolvedValue(100);
      prisma.movement.count.mockResolvedValue(250);
      prisma.user.count.mockResolvedValue(15);
      prisma.asset.aggregate.mockResolvedValue({
        _sum: { purchasePrice: mockDecimal(500000) },
      });
      prisma.asset.groupBy.mockResolvedValue([
        { status: 'EM_ESTOQUE', _count: { id: 40 } },
        { status: 'EM_USO', _count: { id: 60 } },
      ]);

      const result = await service.exportDashboardMetrics('xlsx');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // Verify Excel structure with multiple sheets
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(result as any);
      
      expect(workbook.worksheets.length).toBe(2);
      expect(workbook.getWorksheet('Overview')).toBeDefined();
      expect(workbook.getWorksheet('By Status')).toBeDefined();
    });

    it('should export to CSV format', async () => {
      prisma.asset.count.mockResolvedValue(0);
      prisma.movement.count.mockResolvedValue(0);
      prisma.user.count.mockResolvedValue(0);
      prisma.asset.aggregate.mockResolvedValue({
        _sum: { purchasePrice: null },
      });
      prisma.asset.groupBy.mockResolvedValue([]);

      const result = await service.exportDashboardMetrics('csv');

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle null values gracefully', async () => {
      prisma.asset.count.mockResolvedValue(0);
      prisma.movement.count.mockResolvedValue(0);
      prisma.user.count.mockResolvedValue(0);
      prisma.asset.aggregate.mockResolvedValue({
        _sum: { purchasePrice: null },
      });
      prisma.asset.groupBy.mockResolvedValue([]);

      const result = await service.exportDashboardMetrics('xlsx');

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(result as any);
      
      const overviewSheet = workbook.getWorksheet('Overview');
      expect(overviewSheet).toBeDefined();
      expect(overviewSheet?.rowCount).toBe(5); // Header + 4 metrics
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = mockPrismaClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('should return complete dashboard metrics', async () => {
      const mockDate = new Date('2024-01-15');
      
      const mockDecimal = (value: number) => ({ toNumber: () => value });

      prisma.asset.count.mockResolvedValue(100);
      prisma.asset.groupBy
        .mockResolvedValueOnce([ // byCategory
          { categoryId: 'cat-1', _count: { id: 50 }, _sum: { purchasePrice: mockDecimal(50000) } },
          { categoryId: 'cat-2', _count: { id: 30 }, _sum: { purchasePrice: mockDecimal(30000) } },
        ])
        .mockResolvedValueOnce([ // byLocation
          { locationId: 'loc-1', _count: { id: 60 }, _sum: { purchasePrice: mockDecimal(60000) } },
          { locationId: 'loc-2', _count: { id: 40 }, _sum: { purchasePrice: mockDecimal(40000) } },
        ])
        .mockResolvedValueOnce([ // byStatus
          { status: 'EM_ESTOQUE', _count: { id: 40 } },
          { status: 'EM_USO', _count: { id: 60 } },
        ]);
      
      prisma.movement.count.mockResolvedValue(250);
      prisma.user.count.mockResolvedValue(15);
      prisma.asset.aggregate
        .mockResolvedValueOnce({ _sum: { purchasePrice: mockDecimal(100000) } }) // totalValue
        .mockResolvedValueOnce({ _sum: { purchasePrice: mockDecimal(5000) } }) // month 1
        .mockResolvedValueOnce({ _sum: { purchasePrice: mockDecimal(6000) } }) // month 2
        .mockResolvedValueOnce({ _sum: { purchasePrice: mockDecimal(7000) } }) // month 3
        .mockResolvedValueOnce({ _sum: { purchasePrice: mockDecimal(8000) } }) // month 4
        .mockResolvedValueOnce({ _sum: { purchasePrice: mockDecimal(9000) } }) // month 5
        .mockResolvedValueOnce({ _sum: { purchasePrice: mockDecimal(10000) } }); // month 6

      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Laptops' },
        { id: 'cat-2', name: 'Monitors' },
      ]);
      
      prisma.location.findMany.mockResolvedValue([
        { id: 'loc-1', name: 'Warehouse' },
        { id: 'loc-2', name: 'Office' },
      ]);

      const result = await service.getDashboardMetrics();

      expect(result.overview).toEqual({
        totalAssets: 100,
        totalValue: 100000,
        activeUsers: 15,
        totalMovements: 250,
      });
      expect(result.byCategory).toHaveLength(2);
      expect(result.byCategory[0].category).toBe('Laptops');
      expect(result.byLocation).toHaveLength(2);
      expect(result.byStatus).toHaveLength(2);
      expect(result.trends).toHaveLength(6);
    });

    it('should handle empty data gracefully', async () => {
      prisma.asset.count.mockResolvedValue(0);
      prisma.asset.groupBy.mockResolvedValue([]);
      prisma.movement.count.mockResolvedValue(0);
      prisma.user.count.mockResolvedValue(0);
      prisma.asset.aggregate.mockResolvedValue({ _sum: { purchasePrice: null } });
      prisma.category.findMany.mockResolvedValue([]);
      prisma.location.findMany.mockResolvedValue([]);

      const result = await service.getDashboardMetrics();

      expect(result.overview.totalAssets).toBe(0);
      expect(result.overview.totalValue).toBe(0);
      expect(result.byCategory).toEqual([]);
      expect(result.byLocation).toEqual([]);
    });
  });

  describe('getAssetsByCategory', () => {
    it('should return assets grouped by category', async () => {
      const mockDecimal = (value: number) => ({ toNumber: () => value });
      
      prisma.asset.count.mockResolvedValue(100);
      prisma.asset.groupBy.mockResolvedValue([
        { categoryId: 'cat-1', _count: { id: 60 }, _sum: { purchasePrice: mockDecimal(120000) } },
        { categoryId: 'cat-2', _count: { id: 40 }, _sum: { purchasePrice: mockDecimal(80000) } },
      ]);
      prisma.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Laptops' },
        { id: 'cat-2', name: 'Monitors' },
      ]);

      const result = await service.getAssetsByCategory();

      expect(result.total).toBe(100);
      expect(result.categories).toHaveLength(2);
      expect(result.categories[0]).toEqual({
        id: 'cat-1',
        name: 'Laptops',
        count: 60,
        percentage: 60,
        totalValue: 120000,
        averageValue: 2000,
      });
      expect(result.categories[1]).toEqual({
        id: 'cat-2',
        name: 'Monitors',
        count: 40,
        percentage: 40,
        totalValue: 80000,
        averageValue: 2000,
      });
    });

    it('should handle category without name', async () => {
      const mockDecimal = (value: number) => ({ toNumber: () => value });
      
      prisma.asset.count.mockResolvedValue(10);
      prisma.asset.groupBy.mockResolvedValue([
        { categoryId: null, _count: { id: 10 }, _sum: { purchasePrice: mockDecimal(10000) } },
      ]);
      prisma.category.findMany.mockResolvedValue([]);

      const result = await service.getAssetsByCategory();

      expect(result.categories[0].name).toBe('Sem Categoria');
    });
  });

  describe('getAssetsByLocation', () => {
    it('should return assets grouped by location with status breakdown', async () => {
      const mockDecimal = (value: number) => ({ toNumber: () => value });
      
      prisma.asset.count.mockResolvedValue(100);
      prisma.asset.groupBy.mockResolvedValue([
        { locationId: 'loc-1', status: 'EM_USO', _count: { id: 30 }, _sum: { purchasePrice: mockDecimal(30000) } },
        { locationId: 'loc-1', status: 'EM_ESTOQUE', _count: { id: 20 }, _sum: { purchasePrice: mockDecimal(20000) } },
        { locationId: 'loc-2', status: 'EM_USO', _count: { id: 25 }, _sum: { purchasePrice: mockDecimal(25000) } },
        { locationId: 'loc-2', status: 'EM_ESTOQUE', _count: { id: 25 }, _sum: { purchasePrice: mockDecimal(25000) } },
      ]);
      prisma.location.findMany.mockResolvedValue([
        { id: 'loc-1', name: 'Warehouse' },
        { id: 'loc-2', name: 'Office' },
      ]);

      const result = await service.getAssetsByLocation();

      expect(result.total).toBe(100);
      expect(result.locations).toHaveLength(2);
      expect(result.locations[0]).toEqual({
        id: 'loc-1',
        name: 'Warehouse',
        count: 50,
        percentage: 50,
        totalValue: 50000,
        inUse: 30,
        available: 20,
      });
    });

    it('should handle location without name', async () => {
      const mockDecimal = (value: number) => ({ toNumber: () => value });
      
      prisma.asset.count.mockResolvedValue(10);
      prisma.asset.groupBy.mockResolvedValue([
        { locationId: null, status: 'EM_ESTOQUE', _count: { id: 10 }, _sum: { purchasePrice: mockDecimal(10000) } },
      ]);
      prisma.location.findMany.mockResolvedValue([]);

      const result = await service.getAssetsByLocation();

      expect(result.locations[0].name).toBe('Sem Localização');
    });
  });

  describe('getLicensesExpiring', () => {
    it('should return licenses expiring within specified days', async () => {
      const mockDecimal = (value: number) => ({ toNumber: () => value });
      const today = new Date('2024-01-01');
      const mockLicenses = [
        {
          id: 'lic-1',
          name: 'Windows License',
          expirationDate: new Date('2024-01-20'), // 19 days
          status: 'ATIVA',
          totalSeats: 100,
          usedSeats: 80,
          cost: mockDecimal(50000),
        },
        {
          id: 'lic-2',
          name: 'Office License',
          expirationDate: new Date('2024-02-15'), // 45 days
          status: 'ATIVA',
          totalSeats: 50,
          usedSeats: 45,
          cost: mockDecimal(25000),
        },
        {
          id: 'lic-3',
          name: 'Adobe License',
          expirationDate: new Date('2024-03-01'), // 60 days
          status: 'ATIVA',
          totalSeats: 20,
          usedSeats: 15,
          cost: mockDecimal(30000),
        },
      ];

      prisma.license.findMany.mockResolvedValue(mockLicenses);

      jest.useFakeTimers();
      jest.setSystemTime(today);

      const result = await service.getLicensesExpiring(90);

      jest.useRealTimers();

      expect(result.expiringSoon).toHaveLength(3);
      expect(result.expiringSoon[0].severity).toBe('critical'); // < 30 days
      expect(result.expiringSoon[1].severity).toBe('warning');  // 30-60 days
      expect(result.expiringSoon[2].severity).toBe('warning');  // 30-60 days
      expect(result.summary).toEqual({
        critical: 1,
        warning: 2,
        info: 0,
        totalValue: 105000,
      });
    });

    it('should exclude inactive licenses', async () => {
      prisma.license.findMany.mockResolvedValue([]);

      const result = await service.getLicensesExpiring(30);

      expect(result.expiringSoon).toHaveLength(0);
      expect(prisma.license.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ATIVA',
          }),
        })
      );
    });

    it('should use default 90 days when not specified', async () => {
      prisma.license.findMany.mockResolvedValue([]);

      await service.getLicensesExpiring();

      expect(prisma.license.findMany).toHaveBeenCalled();
    });
  });
});

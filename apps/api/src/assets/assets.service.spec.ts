import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';

describe('AssetsService', () => {
  let service: AssetsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = mockPrismaClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      prisma.asset.count.mockResolvedValue(100);
      prisma.asset.groupBy.mockResolvedValue([
        { status: 'EM_ESTOQUE', _count: { _all: 50 } },
        { status: 'EM_USO', _count: { _all: 30 } },
        { status: 'EM_MANUTENCAO', _count: { _all: 10 } },
        { status: 'INATIVO', _count: { _all: 5 } },
        { status: 'DESCARTADO', _count: { _all: 5 } },
      ]);
      prisma.license = {
        count: jest.fn()
          .mockResolvedValueOnce(25) // totalLicenses
          .mockResolvedValueOnce(5),  // expiringLicenses
      } as any;
      prisma.movement.count.mockResolvedValue(150);
      prisma.asset.aggregate.mockResolvedValue({
        _sum: { purchasePrice: 500000 },
      });

      const result = await service.getDashboardStats();

      expect(result).toEqual({
        totalAssets: 100,
        assetsByStatus: {
          EM_ESTOQUE: 50,
          EM_USO: 30,
          EM_MANUTENCAO: 10,
          INATIVO: 5,
          DESCARTADO: 5,
        },
        totalLicenses: 25,
        expiringLicenses: 5,
        recentMovements: 150,
        totalValue: 500000,
      });
      expect(prisma.asset.count).toHaveBeenCalled();
      expect(prisma.asset.groupBy).toHaveBeenCalled();
      expect(prisma.asset.aggregate).toHaveBeenCalled();
    });

    it('should handle zero values gracefully', async () => {
      prisma.asset.count.mockResolvedValue(0);
      prisma.asset.groupBy.mockResolvedValue([]);
      prisma.license = {
        count: jest.fn().mockResolvedValue(0),
      } as any;
      prisma.movement.count.mockResolvedValue(0);
      prisma.asset.aggregate.mockResolvedValue({
        _sum: { purchasePrice: null },
      });

      const result = await service.getDashboardStats();

      expect(result.totalAssets).toBe(0);
      expect(result.totalValue).toBe(0);
      expect(result.assetsByStatus).toEqual({
        EM_ESTOQUE: 0,
        EM_USO: 0,
        EM_MANUTENCAO: 0,
        INATIVO: 0,
        DESCARTADO: 0,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated assets with default parameters', async () => {
      const mockAssets = [testData.asset];
      prisma.asset.findMany.mockResolvedValue(mockAssets);
      prisma.asset.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result).toEqual({
        items: mockAssets,
        total: 1,
        skip: 0,
        take: 50,
      });
      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        where: {},
        include: {
          category: true,
          location: true,
          manufacturer: true,
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter assets by search term', async () => {
      const mockAssets = [testData.asset];
      prisma.asset.findMany.mockResolvedValue(mockAssets);
      prisma.asset.count.mockResolvedValue(1);

      await service.findAll({ search: 'laptop' });

      expect(prisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'laptop', mode: 'insensitive' } },
              { assetTag: { contains: 'laptop', mode: 'insensitive' } },
              { serialNumber: { contains: 'laptop', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('should filter assets by status', async () => {
      const mockAssets = [testData.asset];
      prisma.asset.findMany.mockResolvedValue(mockAssets);
      prisma.asset.count.mockResolvedValue(1);

      await service.findAll({ status: 'EM_USO' });

      expect(prisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'EM_USO' },
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const mockAssets = Array(10).fill(testData.asset);
      prisma.asset.findMany.mockResolvedValue(mockAssets);
      prisma.asset.count.mockResolvedValue(25);

      const result = await service.findAll({ skip: 10, take: 10 });

      expect(result.skip).toBe(10);
      expect(result.take).toBe(10);
      expect(result.total).toBe(25);
      expect(prisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return asset when found', async () => {
      prisma.asset.findUnique.mockResolvedValue(testData.asset);

      const result = await service.findOne('test-asset-id');

      expect(result).toEqual(testData.asset);
      expect(prisma.asset.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-asset-id' },
        include: {
          category: true,
          location: true,
          manufacturer: true,
          supplier: true,
          assignedTo: true,
          createdBy: { select: { id: true, name: true, email: true } },
          movements: { take: 10, orderBy: { movedAt: 'desc' } },
          maintenances: { take: 10, orderBy: { reportedAt: 'desc' } },
        },
      });
    });

    it('should throw NotFoundException when asset not found', async () => {
      prisma.asset.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException
      );
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Ativo com ID "nonexistent-id" não encontrado'
      );
    });
  });

  describe('create', () => {
    it('should create a new asset', async () => {
      const createDto = {
        assetTag: 'HSI-002',
        name: 'New Asset',
        categoryId: 'test-category-id',
        createdById: 'test-user-id',
      };
      const createdAsset = { ...testData.asset, ...createDto };
      
      // Mock all validations
      prisma.asset.findUnique.mockResolvedValue(null); // assetTag validation
      prisma.asset.findFirst.mockResolvedValue(null); // serialNumber validation
      prisma.category.findUnique.mockResolvedValue(testData.category);
      prisma.user.findUnique.mockResolvedValue(testData.user); // creator validation
      prisma.asset.create.mockResolvedValue(createdAsset);

      const result = await service.create(createDto as any);

      expect(result).toEqual(createdAsset);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.categoryId },
      });
    });
  });

  describe('update', () => {
    it('should update an existing asset', async () => {
      const updateDto = { name: 'Updated Asset Name' };
      const updatedAsset = { ...testData.asset, ...updateDto };
      
      prisma.asset.findUnique.mockResolvedValue(testData.asset);
      prisma.asset.update.mockResolvedValue(updatedAsset);

      const result = await service.update('test-asset-id', updateDto);

      expect(result).toEqual(updatedAsset);
      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { id: 'test-asset-id' },
        data: updateDto,
        include: {
          category: true,
          location: true,
          manufacturer: true,
          supplier: true,
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it('should throw NotFoundException when updating nonexistent asset', async () => {
      prisma.asset.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { name: 'Updated' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an existing asset', async () => {
      prisma.asset.findUnique.mockResolvedValue(testData.asset);
      prisma.maintenance = {
        count: jest.fn().mockResolvedValue(0),
      } as any;
      prisma.asset.delete.mockResolvedValue(testData.asset);

      await service.remove('test-asset-id');

      expect(prisma.asset.delete).toHaveBeenCalledWith({
        where: { id: 'test-asset-id' },
      });
    });

    it('should throw NotFoundException when deleting nonexistent asset', async () => {
      prisma.asset.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});

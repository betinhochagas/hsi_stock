import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';
import { MovementType, AssetStatus } from '@prisma/client';

describe('MovementsService', () => {
  let service: MovementsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsService,
        {
          provide: PrismaService,
          useValue: mockPrismaClient(),
        },
      ],
    }).compile();

    service = module.get<MovementsService>(MovementsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockAsset = { ...testData.asset };
    const mockUser = { ...testData.user };
    const mockLocation = { ...testData.location };

    it('should create a CHECK_OUT movement', async () => {
      const createDto = {
        type: MovementType.CHECK_OUT,
        assetId: testData.asset.id,
        userId: testData.user.id,
        toLocation: 'Escritório',
        movedBy: 'Admin',
      };

      const mockMovement = {
        id: 'mov-1',
        ...createDto,
        fromLocationId: null,
        reason: null,
        ticketNumber: null,
        movedAt: new Date(),
        asset: { id: mockAsset.id, name: mockAsset.name, assetTag: mockAsset.assetTag },
        user: { id: mockUser.id, name: mockUser.name, email: mockUser.email },
        fromLocation: null,
      };

      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.movement.create as jest.Mock).mockResolvedValue(mockMovement);
      (prisma.asset.update as jest.Mock).mockResolvedValue({ ...mockAsset, status: AssetStatus.EM_USO });

      const result = await service.create(createDto);

      expect(result.movement).toEqual(mockMovement);
      expect(prisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: AssetStatus.EM_USO }),
        }),
      );
    });

    it('should throw NotFoundException if asset not found', async () => {
      const createDto = {
        type: MovementType.CHECK_OUT,
        assetId: 'invalid-id',
        toLocation: 'Test',
        movedBy: 'Admin',
      };

      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for CHECK_OUT without location or user', async () => {
      const createDto = {
        type: MovementType.CHECK_OUT,
        assetId: testData.asset.id,
        movedBy: 'Admin',
      };

      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for TRANSFER without fromLocation', async () => {
      const createDto = {
        type: MovementType.TRANSFER,
        assetId: testData.asset.id,
        toLocation: 'Destino',
        movedBy: 'Admin',
      };

      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should create a CHECK_IN movement and update asset status', async () => {
      const createDto = {
        type: MovementType.CHECK_IN,
        assetId: testData.asset.id,
        toLocation: 'Estoque',
        movedBy: 'Admin',
      };

      const mockMovement = {
        id: 'mov-1',
        ...createDto,
        fromLocationId: null,
        userId: null,
        reason: null,
        ticketNumber: null,
        movedAt: new Date(),
        asset: { id: mockAsset.id, name: mockAsset.name, assetTag: mockAsset.assetTag },
        user: null,
        fromLocation: null,
      };

      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);
      (prisma.movement.create as jest.Mock).mockResolvedValue(mockMovement);
      (prisma.asset.update as jest.Mock).mockResolvedValue({
        ...mockAsset,
        status: AssetStatus.EM_ESTOQUE,
        assignedToId: null,
      });

      const result = await service.create(createDto);

      expect(result.movement).toEqual(mockMovement);
      expect(prisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: AssetStatus.EM_ESTOQUE,
            assignedToId: null,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated movements', async () => {
      const mockMovements = [
        {
          id: 'mov-1',
          type: MovementType.CHECK_OUT,
          assetId: testData.asset.id,
          asset: { id: testData.asset.id, name: testData.asset.name, assetTag: testData.asset.assetTag, status: testData.asset.status },
          user: null,
          fromLocation: null,
          toLocation: 'Office',
          movedAt: new Date(),
        },
      ];

      (prisma.movement.findMany as jest.Mock).mockResolvedValue(mockMovements);
      (prisma.movement.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toEqual(mockMovements);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by asset id', async () => {
      (prisma.movement.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.movement.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({ assetId: testData.asset.id });

      expect(prisma.movement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ assetId: testData.asset.id }),
        }),
      );
    });

    it('should filter by type', async () => {
      (prisma.movement.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.movement.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({ type: MovementType.CHECK_OUT });

      expect(prisma.movement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: MovementType.CHECK_OUT }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a movement by id', async () => {
      const mockMovement = {
        id: 'mov-1',
        type: MovementType.CHECK_OUT,
        assetId: testData.asset.id,
        asset: { id: testData.asset.id, name: testData.asset.name, assetTag: testData.asset.assetTag, status: testData.asset.status },
        user: null,
        fromLocation: null,
        toLocation: 'Office',
        movedAt: new Date(),
      };

      (prisma.movement.findUnique as jest.Mock).mockResolvedValue(mockMovement);

      const result = await service.findOne('mov-1');

      expect(result).toEqual(mockMovement);
    });

    it('should throw NotFoundException', async () => {
      (prisma.movement.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAsset', () => {
    it('should return movements for an asset', async () => {
      const mockAsset = { ...testData.asset };
      const mockMovements = [
        {
          id: 'mov-1',
          type: MovementType.CHECK_OUT,
          assetId: testData.asset.id,
          user: null,
          fromLocation: null,
          toLocation: 'Office',
          movedAt: new Date(),
        },
      ];

      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);
      (prisma.movement.findMany as jest.Mock).mockResolvedValue(mockMovements);
      (prisma.movement.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findByAsset(testData.asset.id);

      expect(result.data).toEqual(mockMovements);
      expect(result.pagination.total).toBe(1);
    });

    it('should throw NotFoundException if asset not found', async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findByAsset('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return movements for a user', async () => {
      const mockUser = { ...testData.user };
      const mockMovements = [
        {
          id: 'mov-1',
          type: MovementType.CHECK_OUT,
          userId: testData.user.id,
          asset: { id: testData.asset.id, name: testData.asset.name, assetTag: testData.asset.assetTag, status: testData.asset.status },
          fromLocation: null,
          toLocation: 'Office',
          movedAt: new Date(),
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.movement.findMany as jest.Mock).mockResolvedValue(mockMovements);
      (prisma.movement.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findByUser(testData.user.id);

      expect(result.data).toEqual(mockMovements);
      expect(result.pagination.total).toBe(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findByUser('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});

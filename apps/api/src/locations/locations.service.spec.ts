import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';

describe('LocationsService', () => {
  let service: LocationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaClient(),
        },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new location', async () => {
      const createDto = {
        name: 'TI - Sala 102',
        description: 'Sala de servidores',
        building: 'Prédio A',
        floor: '1º andar',
        room: '102',
      };
      const expectedLocation = { id: 'loc-1', ...createDto, createdAt: new Date(), updatedAt: new Date() };

      (prisma.location.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.location.create as jest.Mock).mockResolvedValue(expectedLocation);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedLocation);
      expect(prisma.location.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
    });

    it('should throw ConflictException if location name exists', async () => {
      const createDto = { name: 'TI - Sala 102' };
      (prisma.location.findUnique as jest.Mock).mockResolvedValue({ id: 'loc-1', ...createDto });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated locations with counts', async () => {
      const mockLocations = [{
        ...testData.location,
        _count: { assets: 10, movements: 5 },
      }];

      (prisma.location.findMany as jest.Mock).mockResolvedValue(mockLocations);
      (prisma.location.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.items).toEqual(mockLocations);
      expect(result.total).toBe(1);
    });

    it('should filter by search term', async () => {
      (prisma.location.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.location.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({ search: 'Sala' });

      expect(prisma.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.any(Object) }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a location by id', async () => {
      const mockLocation = { ...testData.location, _count: { assets: 5, movements: 2 } };

      (prisma.location.findUnique as jest.Mock).mockResolvedValue(mockLocation);

      const result = await service.findOne(testData.location.id);

      expect(result).toEqual(mockLocation);
    });

    it('should throw NotFoundException', async () => {
      (prisma.location.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a location', async () => {
      const updateDto = { description: 'Nova descrição' };
      const mockLocation = { ...testData.location, _count: { assets: 0, movements: 0 } };

      (prisma.location.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockLocation)
        .mockResolvedValueOnce(null);
      (prisma.location.update as jest.Mock).mockResolvedValue({ ...mockLocation, ...updateDto });

      const result = await service.update(testData.location.id, updateDto);

      expect(result.description).toBe(updateDto.description);
    });

    it('should throw ConflictException on name conflict', async () => {
      const updateDto = { name: 'Nome Existente' };
      const mockLocation = { ...testData.location, _count: { assets: 0, movements: 0 } };

      (prisma.location.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockLocation)
        .mockResolvedValueOnce({ id: 'other-id', name: 'Nome Existente' });

      await expect(service.update(testData.location.id, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a location without assets', async () => {
      const mockLocation = { ...testData.location, _count: { assets: 0, movements: 0 } };

      (prisma.location.findUnique as jest.Mock).mockResolvedValue(mockLocation);
      (prisma.asset.count as jest.Mock).mockResolvedValue(0);
      (prisma.location.delete as jest.Mock).mockResolvedValue(mockLocation);

      const result = await service.remove(testData.location.id);

      expect(result.message).toContain('sucesso');
    });

    it('should throw ConflictException if location has assets', async () => {
      const mockLocation = { ...testData.location, _count: { assets: 5, movements: 0 } };

      (prisma.location.findUnique as jest.Mock).mockResolvedValue(mockLocation);
      (prisma.asset.count as jest.Mock).mockResolvedValue(5);

      await expect(service.remove(testData.location.id)).rejects.toThrow(ConflictException);
    });
  });
});

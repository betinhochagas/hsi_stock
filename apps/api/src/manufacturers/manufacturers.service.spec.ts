import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';

describe('ManufacturersService', () => {
  let service: ManufacturersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManufacturersService,
        {
          provide: PrismaService,
          useValue: mockPrismaClient(),
        },
      ],
    }).compile();

    service = module.get<ManufacturersService>(ManufacturersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new manufacturer', async () => {
      const createDto = {
        name: 'Dell',
        website: 'https://dell.com',
        contactEmail: 'contact@dell.com',
      };

      (prisma.manufacturer.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.manufacturer.create as jest.Mock).mockResolvedValue({
        id: 'manu-1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(prisma.manufacturer.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
    });

    it('should throw ConflictException if manufacturer name already exists', async () => {
      const createDto = { name: 'Dell' };

      (prisma.manufacturer.findUnique as jest.Mock).mockResolvedValue(
        testData.manufacturer,
      );

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated manufacturers', async () => {
      const manufacturers = [testData.manufacturer];

      (prisma.manufacturer.findMany as jest.Mock).mockResolvedValue(manufacturers);
      (prisma.manufacturer.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(result).toEqual({
        items: manufacturers,
        total: 1,
        skip: 0,
        take: 50,
      });
    });

    it('should filter by search term', async () => {
      (prisma.manufacturer.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.manufacturer.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({ search: 'Dell' });

      expect(prisma.manufacturer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { name: { contains: 'Dell', mode: 'insensitive' } },
            ]),
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a manufacturer by id', async () => {
      (prisma.manufacturer.findUnique as jest.Mock).mockResolvedValue({
        ...testData.manufacturer,
        _count: { assets: 10 },
      });

      const result = await service.findOne('test-id');

      expect(result.id).toBe(testData.manufacturer.id);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.manufacturer.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a manufacturer', async () => {
      const updateDto = { website: 'https://new-website.com' };

      (prisma.manufacturer.findUnique as jest.Mock)
        .mockResolvedValueOnce(testData.manufacturer)
        .mockResolvedValueOnce(null);

      (prisma.manufacturer.update as jest.Mock).mockResolvedValue({
        ...testData.manufacturer,
        ...updateDto,
      });

      const result = await service.update('test-id', updateDto);

      expect(result.website).toBe(updateDto.website);
    });

    it('should throw ConflictException if new name exists', async () => {
      const updateDto = { name: 'Existing Name' };

      (prisma.manufacturer.findUnique as jest.Mock)
        .mockResolvedValueOnce(testData.manufacturer)
        .mockResolvedValueOnce({ ...testData.manufacturer, id: 'other-id' });

      await expect(service.update('test-id', updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove manufacturer without assets', async () => {
      (prisma.manufacturer.findUnique as jest.Mock).mockResolvedValue(
        testData.manufacturer,
      );
      (prisma.asset.count as jest.Mock).mockResolvedValue(0);
      (prisma.manufacturer.delete as jest.Mock).mockResolvedValue(
        testData.manufacturer,
      );

      const result = await service.remove('test-id');

      expect(result.message).toBe('Fabricante removido com sucesso');
    });

    it('should throw ConflictException if has linked assets', async () => {
      (prisma.manufacturer.findUnique as jest.Mock).mockResolvedValue(
        testData.manufacturer,
      );
      (prisma.asset.count as jest.Mock).mockResolvedValue(5);

      await expect(service.remove('test-id')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});

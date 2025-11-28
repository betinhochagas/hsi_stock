import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaClient(),
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createDto = { name: 'Nova Categoria', description: 'Teste' };
      const expectedCategory = { id: 'cat-1', ...createDto, createdAt: new Date(), updatedAt: new Date() };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.category.create as jest.Mock).mockResolvedValue(expectedCategory);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedCategory);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(prisma.category.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should throw ConflictException if category name already exists', async () => {
      const createDto = { name: 'Categoria Existente', description: 'Teste' };
      const existingCategory = { id: 'cat-1', ...createDto };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue(existingCategory);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(prisma.category.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const mockCategories = [testData.category];
      const total = 1;

      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);
      (prisma.category.count as jest.Mock).mockResolvedValue(total);

      const result = await service.findAll({ skip: 0, take: 10 });

      expect(result).toEqual({ items: mockCategories, total, skip: 0, take: 10 });
      expect(prisma.category.findMany).toHaveBeenCalled();
      expect(prisma.category.count).toHaveBeenCalled();
    });

    it('should filter categories by search term', async () => {
      const mockCategories = [testData.category];

      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);
      (prisma.category.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ search: 'Desktop' });

      expect(result.items).toEqual(mockCategories);
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const mockCategory = { ...testData.category, _count: { assets: 5 } };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.findOne(testData.category.id);

      expect(result).toEqual(mockCategory);
      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: testData.category.id },
        include: { _count: { select: { assets: true } } },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = { description: 'Nova descrição' };
      const existingCategory = { ...testData.category, _count: { assets: 0 } };
      const updatedCategory = { ...existingCategory, ...updateDto };

      (prisma.category.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingCategory) // findOne call
        .mockResolvedValueOnce(null); // name conflict check
      (prisma.category.update as jest.Mock).mockResolvedValue(updatedCategory);

      const result = await service.update(testData.category.id, updateDto);

      expect(result).toEqual(updatedCategory);
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: testData.category.id },
        data: updateDto,
      });
    });

    it('should throw ConflictException if new name already exists', async () => {
      const updateDto = { name: 'Nome Existente' };
      const existingCategory = { ...testData.category, _count: { assets: 0 } };
      const conflictCategory = { id: 'other-id', name: 'Nome Existente' };

      (prisma.category.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(conflictCategory);

      await expect(service.update(testData.category.id, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a category without assets', async () => {
      const mockCategory = { ...testData.category, _count: { assets: 0 } };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.asset.count as jest.Mock).mockResolvedValue(0);
      (prisma.category.delete as jest.Mock).mockResolvedValue(mockCategory);

      const result = await service.remove(testData.category.id);

      expect(result).toEqual({ message: 'Categoria removida com sucesso' });
      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: testData.category.id },
      });
    });

    it('should throw ConflictException if category has assets', async () => {
      const mockCategory = { ...testData.category, _count: { assets: 5 } };

      (prisma.category.findUnique as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.asset.count as jest.Mock).mockResolvedValue(5);

      await expect(service.remove(testData.category.id)).rejects.toThrow(ConflictException);
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });
  });
});

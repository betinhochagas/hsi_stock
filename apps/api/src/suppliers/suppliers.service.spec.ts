import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let prisma: PrismaService;

  const mockSupplier = {
    id: 'sup-1',
    name: 'Tech Supplier',
    cnpj: '12.345.678/0001-90',
    contact: 'John Doe',
    email: 'contact@supplier.com',
    phone: '+1234567890',
    address: '123 Supplier St',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: PrismaService,
          useValue: mockPrismaClient(),
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new supplier', async () => {
      const createDto = {
        name: 'New Supplier',
        cnpj: '98.765.432/0001-10',
        contact: 'Jane Doe',
        email: 'jane@supplier.com',
      };

      (prisma.supplier.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // check name
        .mockResolvedValueOnce(null); // check cnpj

      (prisma.supplier.create as jest.Mock).mockResolvedValue({
        id: 'sup-2',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result.name).toBe(createDto.name);
      expect(prisma.supplier.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if name already exists', async () => {
      const createDto = { name: 'Existing Supplier' };

      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(mockSupplier);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if CNPJ already exists', async () => {
      const createDto = {
        name: 'New Supplier',
        cnpj: '12.345.678/0001-90',
      };

      (prisma.supplier.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // check name
        .mockResolvedValueOnce(mockSupplier); // check cnpj

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated suppliers', async () => {
      (prisma.supplier.findMany as jest.Mock).mockResolvedValue([mockSupplier]);
      (prisma.supplier.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(result).toEqual({
        items: [mockSupplier],
        total: 1,
        skip: 0,
        take: 50,
      });
    });

    it('should filter by search term', async () => {
      (prisma.supplier.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.supplier.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({ search: 'Tech' });

      expect(prisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { name: { contains: 'Tech', mode: 'insensitive' } },
            ]),
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue({
        ...mockSupplier,
        _count: { assets: 5, contracts: 2 },
      });

      const result = await service.findOne('sup-1');

      expect(result.id).toBe(mockSupplier.id);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a supplier', async () => {
      const updateDto = { email: 'new@supplier.com' };

      (prisma.supplier.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSupplier)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      (prisma.supplier.update as jest.Mock).mockResolvedValue({
        ...mockSupplier,
        ...updateDto,
      });

      const result = await service.update('sup-1', updateDto);

      expect(result.email).toBe(updateDto.email);
    });

    it('should throw ConflictException if new name exists', async () => {
      const updateDto = { name: 'Existing Name' };

      (prisma.supplier.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSupplier)
        .mockResolvedValueOnce({ ...mockSupplier, id: 'other-id' });

      await expect(service.update('sup-1', updateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if new CNPJ exists', async () => {
      const updateDto = { cnpj: '98.765.432/0001-10' };

      // Mock sequence: findOne, then cnpj check (no name check because name is not in updateDto)
      (prisma.supplier.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSupplier) // findOne check
        .mockResolvedValueOnce({ ...mockSupplier, id: 'other-id' }); // cnpj conflict check

      await expect(service.update('sup-1', updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove supplier without assets or contracts', async () => {
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(mockSupplier);
      (prisma.asset.count as jest.Mock).mockResolvedValue(0);
      (prisma.contract.count as jest.Mock).mockResolvedValue(0);
      (prisma.supplier.delete as jest.Mock).mockResolvedValue(mockSupplier);

      const result = await service.remove('sup-1');

      expect(result.message).toBe('Fornecedor removido com sucesso');
    });

    it('should throw ConflictException if has linked assets', async () => {
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(mockSupplier);
      (prisma.asset.count as jest.Mock).mockResolvedValue(5);

      await expect(service.remove('sup-1')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if has linked contracts', async () => {
      (prisma.supplier.findUnique as jest.Mock).mockResolvedValue(mockSupplier);
      (prisma.asset.count as jest.Mock).mockResolvedValue(0);
      (prisma.contract.count as jest.Mock).mockResolvedValue(2);

      await expect(service.remove('sup-1')).rejects.toThrow(ConflictException);
    });
  });
});

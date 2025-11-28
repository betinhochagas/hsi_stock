import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';
import { LicenseStatus } from '@prisma/client';

describe('LicensesService', () => {
  let service: LicensesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicensesService,
        {
          provide: PrismaService,
          useValue: mockPrismaClient(),
        },
      ],
    }).compile();

    service = module.get<LicensesService>(LicensesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new license', async () => {
      const createDto = {
        name: 'Microsoft Office 365',
        licenseKey: 'XXXXX-XXXXX-XXXXX',
        totalSeats: 10,
        purchaseDate: '2024-01-01',
        expirationDate: '2025-01-01',
        cost: 1000,
        vendor: 'Microsoft',
      };

      const mockLicense = {
        id: 'lic-1',
        ...createDto,
        usedSeats: 0,
        status: LicenseStatus.ATIVA,
        assignments: [],
      };

      (prisma.license.create as jest.Mock).mockResolvedValue(mockLicense);

      const result = await service.create(createDto);

      expect(result.license).toEqual(mockLicense);
      expect(result.message).toContain('sucesso');
    });

    it('should throw BadRequestException if expiration date is before purchase date', async () => {
      const createDto = {
        name: 'Test License',
        licenseKey: 'TEST',
        totalSeats: 5,
        purchaseDate: '2025-01-01',
        expirationDate: '2024-01-01',
        cost: 100,
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated licenses', async () => {
      const mockLicenses = [{ ...testData.license, assignments: [], _count: { assignments: 0 } }];

      (prisma.license.findMany as jest.Mock).mockResolvedValue(mockLicenses);
      (prisma.license.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toEqual(mockLicenses);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by search term', async () => {
      (prisma.license.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.license.count as jest.Mock).mockResolvedValue(0);

      await service.findAll({ search: 'Office' });

      expect(prisma.license.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a license by id', async () => {
      const mockLicense = { ...testData.license, assignments: [], _count: { assignments: 0 } };

      (prisma.license.findUnique as jest.Mock).mockResolvedValue(mockLicense);

      const result = await service.findOne(testData.license.id);

      expect(result).toEqual(mockLicense);
    });

    it('should throw NotFoundException', async () => {
      (prisma.license.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a license', async () => {
      const updateDto = { totalSeats: 15 };
      const mockLicense = { ...testData.license, usedSeats: 5, assignments: [] };

      (prisma.license.findUnique as jest.Mock).mockResolvedValue(mockLicense);
      (prisma.license.update as jest.Mock).mockResolvedValue({ ...mockLicense, ...updateDto, assignments: [] });

      const result = await service.update(testData.license.id, updateDto);

      expect(result.license.totalSeats).toBe(15);
    });

    it('should throw ConflictException if reducing seats below used', async () => {
      const updateDto = { totalSeats: 3 };
      const mockLicense = { ...testData.license, usedSeats: 5, assignments: [] };

      (prisma.license.findUnique as jest.Mock).mockResolvedValue(mockLicense);

      await expect(service.update(testData.license.id, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a license without assignments', async () => {
      const mockLicense = { ...testData.license, assignments: [] };

      (prisma.license.findUnique as jest.Mock).mockResolvedValue(mockLicense);
      (prisma.license.delete as jest.Mock).mockResolvedValue(mockLicense);

      const result = await service.remove(testData.license.id);

      expect(result.message).toContain('sucesso');
    });

    it('should throw ConflictException if license has assignments', async () => {
      const mockLicense = {
        ...testData.license,
        assignments: [{ id: 'assign-1', deviceName: 'PC01' }],
      };

      (prisma.license.findUnique as jest.Mock).mockResolvedValue(mockLicense);

      await expect(service.remove(testData.license.id)).rejects.toThrow(ConflictException);
    });
  });

  describe('assign', () => {
    it('should assign a license to a device', async () => {
      const assignDto = { deviceName: 'PC01', userName: 'João Silva', email: 'joao@example.com' };
      const mockLicense = { ...testData.license, usedSeats: 5, totalSeats: 10, assignments: [] };
      const mockAssignment = { id: 'assign-1', licenseId: testData.license.id, ...assignDto, license: mockLicense };

      (prisma.license.findUnique as jest.Mock).mockResolvedValue(mockLicense);
      (prisma.licenseAssignment.create as jest.Mock).mockResolvedValue(mockAssignment);
      (prisma.license.update as jest.Mock).mockResolvedValue({ ...mockLicense, usedSeats: 6 });

      const result = await service.assign(testData.license.id, assignDto);

      expect(result.assignment).toEqual(mockAssignment);
      expect(prisma.license.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { usedSeats: 6 },
        }),
      );
    });

    it('should throw ConflictException if no seats available', async () => {
      const assignDto = { deviceName: 'PC01' };
      const mockLicense = { ...testData.license, usedSeats: 10, totalSeats: 10, assignments: [] };

      (prisma.license.findUnique as jest.Mock).mockResolvedValue(mockLicense);

      await expect(service.assign(testData.license.id, assignDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if no identifying fields provided', async () => {
      const assignDto = {};
      const mockLicense = { ...testData.license, usedSeats: 5, totalSeats: 10 };

      (prisma.license.findUnique as jest.Mock).mockResolvedValue(mockLicense);

      await expect(service.assign(testData.license.id, assignDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('revoke', () => {
    it('should revoke a license assignment', async () => {
      const assignmentId = 'assign-1';
      const mockLicense = { ...testData.license, usedSeats: 6 };
      const mockAssignment = {
        id: assignmentId,
        licenseId: testData.license.id,
        deviceName: 'PC01',
        license: mockLicense,
      };

      (prisma.licenseAssignment.findUnique as jest.Mock).mockResolvedValue(mockAssignment);
      (prisma.licenseAssignment.delete as jest.Mock).mockResolvedValue(mockAssignment);
      (prisma.license.update as jest.Mock).mockResolvedValue({ ...mockLicense, usedSeats: 5 });

      const result = await service.revoke(testData.license.id, assignmentId);

      expect(result.message).toContain('sucesso');
      expect(prisma.license.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { usedSeats: 5 },
        }),
      );
    });

    it('should throw NotFoundException if assignment not found', async () => {
      (prisma.licenseAssignment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.revoke(testData.license.id, 'invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findExpiring', () => {
    it('should return licenses expiring in specified days', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      const mockLicenses = [{
        ...testData.license,
        expirationDate: futureDate,
        status: LicenseStatus.ATIVA,
        assignments: [],
        _count: { assignments: 0 },
      }];

      (prisma.license.findMany as jest.Mock).mockResolvedValue(mockLicenses);

      const result = await service.findExpiring(30);

      expect(result.data).toEqual(mockLicenses);
      expect(result.count).toBe(1);
      expect(result.expiringIn).toBe('30 dias');
    });
  });
});

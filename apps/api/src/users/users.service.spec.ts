import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaClient, testData } from '../test/setup';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaClient(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(testData.user);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(testData.user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users without password field', async () => {
      const users = [
        {
          id: testData.user.id,
          email: testData.user.email,
          name: testData.user.name,
          role: testData.user.role,
          active: testData.user.active,
          createdAt: testData.user.createdAt,
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });
    });

    it('should return empty array if no users exist', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});

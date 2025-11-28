import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$10$hashedPassword',
    role: 'ADMIN',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        active: mockUser.active,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result.password).toBeUndefined();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validateUser('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validateUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.validateUser('test@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validateUser('test@example.com', 'password123')
      ).rejects.toThrow('Usuário inativo');
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const { password, ...userWithoutPassword } = mockUser;
      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(userWithoutPassword);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should generate different tokens for different users', async () => {
      const user1 = { id: 'user1', email: 'user1@example.com', name: 'User 1', role: 'USER' };
      const user2 = { id: 'user2', email: 'user2@example.com', name: 'User 2', role: 'ADMIN' };
      
      mockJwtService.sign
        .mockReturnValueOnce('token1')
        .mockReturnValueOnce('token2');

      const result1 = await service.login(user1);
      const result2 = await service.login(user2);

      expect(result1.access_token).toBe('token1');
      expect(result2.access_token).toBe('token2');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});

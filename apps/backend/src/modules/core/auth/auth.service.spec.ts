import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockPrisma = {
    user: { findMany: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    tenant: { findUnique: jest.fn(), create: jest.fn() },
    role: { findUnique: jest.fn(), create: jest.fn() },
    userRole: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockJwtService = { sign: jest.fn().mockReturnValue('mock-token') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = { email: 'test@test.com', password: 'Pass@123' };
    const mockUser = {
      id: 'user-1', email: 'test@test.com', name: 'Test',
      passwordHash: '$2b$10$hashedpassword', tenantId: 'tenant-1', status: 'active',
      userRoles: [{ role: { name: 'tenant_admin' } }],
      tenant: { id: 'tenant-1', name: 'Test Tenant', slug: 'test-tenant' },
    };

    it('should return token and user on valid credentials', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
      expect(result.user.roles).toEqual(['tenant_admin']);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on non-existent user', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should require tenantSlug when multiple users have same email', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser, { ...mockUser, id: 'user-2', tenantId: 'tenant-2' }]);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should scope to tenant when tenantSlug provided', async () => {
      const tenant = { id: 'tenant-1', slug: 'test-tenant' };
      prisma.tenant.findUnique.mockResolvedValue(tenant);
      prisma.user.findMany.mockResolvedValue([mockUser]);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login({ ...loginDto, tenantSlug: 'test-tenant' });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1' }) })
      );
      expect(result.access_token).toBeDefined();
    });
  });

  describe('getMe', () => {
    it('should return user info', async () => {
      const mockUser = {
        id: 'user-1', name: 'Test', email: 'test@test.com', tenantId: 'tenant-1',
        userRoles: [{ role: { name: 'tenant_admin' } }],
        tenant: { name: 'Test Tenant', slug: 'test-tenant' },
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe('user-1');

      expect(result.id).toBe('user-1');
      expect(result.roles).toEqual(['tenant_admin']);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('invalid-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});

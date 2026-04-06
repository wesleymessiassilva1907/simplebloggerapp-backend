import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const whereClause: any = { email: dto.email, status: 'active' };

    // If tenantSlug provided, scope to that tenant
    if (dto.tenantSlug) {
      const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } });
      if (!tenant) throw new UnauthorizedException('Tenant not found');
      whereClause.tenantId = tenant.id;
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: { userRoles: { include: { role: true } }, tenant: true },
    });

    if (users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (users.length > 1 && !dto.tenantSlug) {
      // Multiple users with same email across tenants - need tenant context
      const tenants = users.map(u => ({ id: u.tenant.id, name: u.tenant.name, slug: u.tenant.slug }));
      throw new UnauthorizedException({
        message: 'Multiple accounts found. Please provide tenantSlug.',
        tenants,
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        tenantSlug: user.tenant.slug,
        roles,
      },
    };
  }

  async registerInitialTenantAdmin(dto: RegisterTenantDto) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.tenantSlug },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant slug already exists');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          slug: dto.tenantSlug,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: dto.name,
          email: dto.email,
          passwordHash,
        },
      });

      let role = await tx.role.findUnique({ where: { name: 'tenant_admin' } });
      if (!role) {
        role = await tx.role.create({
          data: { name: 'tenant_admin', description: 'Tenant Administrator' },
        });
      }

      await tx.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });

      return { tenant, user };
    });

    const payload = {
      sub: result.user.id,
      email: result.user.email,
      tenantId: result.tenant.id,
      roles: ['tenant_admin'],
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        tenantId: result.tenant.id,
        tenantName: result.tenant.name,
        tenantSlug: result.tenant.slug,
        roles: ['tenant_admin'],
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } }, tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      tenantSlug: user.tenant.slug,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } }, tenant: true },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (user.tenant.status !== 'active') {
      throw new UnauthorizedException('Tenant is not active');
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId, roles };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id, name: user.name, email: user.email,
        tenantId: user.tenantId, tenantName: user.tenant.name,
        tenantSlug: user.tenant.slug, roles,
      },
    };
  }
}

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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email, status: 'active' } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'Se o email existir, um link de recuperacao sera enviado.' };
    }

    // Generate reset token (stored as notification for now, future: separate table)
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.notification.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        type: 'password_reset',
        title: 'Password Reset',
        content: resetToken,
        status: 'pending',
        metadata: { expiresAt: resetExpiry.toISOString() },
      },
    });

    // Future: send email with reset link
    console.log(`[Password Reset] Token for ${email}: ${resetToken}`);

    return { message: 'Se o email existir, um link de recuperacao sera enviado.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { type: 'password_reset', content: token, status: 'pending' },
    });

    if (!notification) {
      throw new UnauthorizedException('Token invalido ou expirado');
    }

    const metadata = notification.metadata as any;
    if (metadata?.expiresAt && new Date(metadata.expiresAt) < new Date()) {
      await this.prisma.notification.update({ where: { id: notification.id }, data: { status: 'failed' } });
      throw new UnauthorizedException('Token expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: notification.userId! }, data: { passwordHash } });
    await this.prisma.notification.update({ where: { id: notification.id }, data: { status: 'sent' } });

    return { message: 'Senha alterada com sucesso' };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        include: { user: { select: { name: true, email: true } } },
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async log(tenantId: string, userId: string, action: string, entity: string, entityId?: string, metadata?: any) {
    return this.prisma.auditLog.create({
      data: { tenantId, userId, action, entity, entityId, metadata },
    });
  }
}

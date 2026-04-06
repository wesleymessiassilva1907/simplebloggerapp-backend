import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({ where: { tenantId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async send(tenantId: string, userId: string, type: string, title: string, content: string, metadata?: any) {
    const notification = await this.prisma.notification.create({
      data: { tenantId, userId, type, title, content, metadata },
    });
    // Future: send email/whatsapp based on type
    console.log(`[Notification] ${type}: ${title} -> ${userId}`);
    return notification;
  }
}

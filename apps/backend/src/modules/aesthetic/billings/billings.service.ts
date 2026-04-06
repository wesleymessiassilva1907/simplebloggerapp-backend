import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAestheticBillingDto } from './dto/create-billing.dto';
import { UpdateAestheticBillingDto } from './dto/update-billing.dto';

@Injectable()
export class AestheticBillingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, clientId?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.aestheticBilling.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: true },
      }),
      this.prisma.aestheticBilling.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const billing = await this.prisma.aestheticBilling.findFirst({
      where: { id, tenantId },
      include: { client: true },
    });
    if (!billing) throw new NotFoundException('Cobrança não encontrada');
    return billing;
  }

  async create(tenantId: string, dto: CreateAestheticBillingDto) {
    const data: any = { tenantId, ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.paidAt) data.paidAt = new Date(dto.paidAt);
    return this.prisma.aestheticBilling.create({
      data,
      include: { client: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateAestheticBillingDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.paidAt) data.paidAt = new Date(dto.paidAt);
    return this.prisma.aestheticBilling.update({
      where: { id },
      data,
      include: { client: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.aestheticBilling.delete({ where: { id } });
  }
}

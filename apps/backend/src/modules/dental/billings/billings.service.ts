import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDentalBillingDto } from './dto/create-billing.dto';
import { UpdateDentalBillingDto } from './dto/update-billing.dto';

@Injectable()
export class DentalBillingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, patientId?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.dentalBilling.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { patient: true },
      }),
      this.prisma.dentalBilling.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const billing = await this.prisma.dentalBilling.findFirst({
      where: { id, tenantId },
      include: { patient: true },
    });
    if (!billing) throw new NotFoundException('Billing not found');
    return billing;
  }

  async create(tenantId: string, dto: CreateDentalBillingDto) {
    return this.prisma.dentalBilling.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        description: dto.description,
        amount: dto.amount,
        status: dto.status || 'pending',
        paymentMethod: dto.paymentMethod,
        installments: dto.installments || 1,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
      include: { patient: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDentalBillingDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.paidAt) data.paidAt = new Date(dto.paidAt);
    return this.prisma.dentalBilling.update({
      where: { id },
      data,
      include: { patient: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dentalBilling.delete({ where: { id } });
  }
}

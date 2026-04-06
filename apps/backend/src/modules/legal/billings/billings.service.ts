import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateLegalBillingDto } from './dto/create-billing.dto';
import { UpdateLegalBillingDto } from './dto/update-billing.dto';

@Injectable()
export class LegalBillingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    clientId?: string,
    caseId?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (clientId) where.clientId = clientId;
    if (caseId) where.caseId = caseId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.legalBilling.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, cpfCnpj: true } },
          case: { select: { id: true, caseNumber: true, title: true } },
        },
      }),
      this.prisma.legalBilling.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const billing = await this.prisma.legalBilling.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, name: true, cpfCnpj: true } },
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    });
    if (!billing) throw new NotFoundException('Cobrança não encontrada');
    return billing;
  }

  async create(tenantId: string, dto: CreateLegalBillingDto) {
    let amount = dto.amount;
    if (dto.hoursWorked && dto.hourlyRate) {
      amount = dto.hoursWorked * dto.hourlyRate;
    }

    const data: any = {
      tenantId,
      clientId: dto.clientId,
      caseId: dto.caseId,
      description: dto.description,
      type: dto.type,
      amount: amount || 0,
      hoursWorked: dto.hoursWorked,
      hourlyRate: dto.hourlyRate,
      status: dto.status || 'pendente',
    };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.paidAt) data.paidAt = new Date(dto.paidAt);

    return this.prisma.legalBilling.create({
      data,
      include: {
        client: { select: { id: true, name: true } },
        case: { select: { id: true, caseNumber: true, title: true } },
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateLegalBillingDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };

    if (dto.hoursWorked !== undefined && dto.hourlyRate !== undefined) {
      data.amount = dto.hoursWorked * dto.hourlyRate;
    }
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.paidAt) data.paidAt = new Date(dto.paidAt);

    return this.prisma.legalBilling.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.legalBilling.delete({ where: { id } });
  }
}

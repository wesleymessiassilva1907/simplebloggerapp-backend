import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateLegalCaseDto } from './dto/create-case.dto';
import { UpdateLegalCaseDto } from './dto/update-case.dto';

@Injectable()
export class LegalCasesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    clientId?: string,
    status?: string,
    type?: string,
    priority?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const [data, total] = await Promise.all([
      this.prisma.legalCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { id: true, name: true, cpfCnpj: true } } },
      }),
      this.prisma.legalCase.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const legalCase = await this.prisma.legalCase.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        documents: { orderBy: { createdAt: 'desc' }, take: 10 },
        tasks: { orderBy: { dueDate: 'asc' }, take: 10 },
        billings: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!legalCase) throw new NotFoundException('Processo não encontrado');
    return legalCase;
  }

  async create(tenantId: string, dto: CreateLegalCaseDto) {
    const data: any = {
      tenantId,
      clientId: dto.clientId,
      caseNumber: dto.caseNumber,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      court: dto.court,
      judge: dto.judge,
      status: dto.status || 'novo',
      priority: dto.priority || 'media',
      value: dto.value,
      notes: dto.notes,
    };
    if (dto.filingDate) data.filingDate = new Date(dto.filingDate);
    if (dto.nextHearingDate) data.nextHearingDate = new Date(dto.nextHearingDate);
    return this.prisma.legalCase.create({ data, include: { client: { select: { id: true, name: true } } } });
  }

  async update(id: string, tenantId: string, dto: UpdateLegalCaseDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.filingDate) data.filingDate = new Date(dto.filingDate);
    if (dto.nextHearingDate) data.nextHearingDate = new Date(dto.nextHearingDate);
    return this.prisma.legalCase.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.legalCase.delete({ where: { id } });
  }

  async dashboard(tenantId: string) {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    const [
      totalByStatus,
      upcomingHearings,
      overdueTasks,
      totalCases,
    ] = await Promise.all([
      this.prisma.legalCase.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),
      this.prisma.legalCase.findMany({
        where: {
          tenantId,
          nextHearingDate: { gte: now, lte: in7Days },
          status: { notIn: ['arquivado', 'encerrado'] },
        },
        orderBy: { nextHearingDate: 'asc' },
        take: 10,
        include: { client: { select: { id: true, name: true } } },
      }),
      this.prisma.legalTask.count({
        where: {
          tenantId,
          dueDate: { lt: now },
          status: { notIn: ['concluida', 'cancelada'] },
        },
      }),
      this.prisma.legalCase.count({ where: { tenantId } }),
    ]);

    return {
      totalCases,
      casesByStatus: totalByStatus.map((s) => ({ status: s.status, count: s._count.id })),
      upcomingHearings,
      overdueTasks,
    };
  }
}

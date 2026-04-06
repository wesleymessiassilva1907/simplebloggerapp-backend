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
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalByStatus,
      upcomingHearings,
      overdueTasks,
      totalCases,
      thisMonthCases,
      lastMonthCases,
      allCases,
      allTasks,
      thisMonthBillings,
      hearingsThisWeek,
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
      this.prisma.legalCase.count({ where: { tenantId, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
      this.prisma.legalCase.count({ where: { tenantId, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
      this.prisma.legalCase.findMany({
        where: { tenantId },
        select: { id: true, title: true, value: true, status: true, createdAt: true, filingDate: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.legalTask.findMany({
        where: { tenantId },
        select: { status: true, dueDate: true },
      }),
      this.prisma.legalBilling.aggregate({
        where: { tenantId, status: 'paid', paidAt: { gte: thisMonthStart, lt: thisMonthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.legalCase.count({
        where: {
          tenantId,
          nextHearingDate: { gte: now, lte: in7Days },
          status: { notIn: ['arquivado', 'encerrado'] },
        },
      }),
    ]);

    // Cases by month (last 6 months)
    const casesByMonth: { date: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = allCases.filter(c => c.createdAt >= mStart && c.createdAt < mEnd).length;
      casesByMonth.push({ date: mStart.toISOString().slice(0, 7), value: count });
    }

    // Comparison vs last month
    const comparisonVsLastMonth = {
      current: thisMonthCases,
      previous: lastMonthCases,
      percentChange: lastMonthCases > 0 ? Math.round(((thisMonthCases - lastMonthCases) / lastMonthCases) * 100) : 0,
    };

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    if (overdueTasks > 0) {
      alerts.push({ type: 'critical', message: `${overdueTasks} overdue task(s) require immediate attention` });
    }
    if (hearingsThisWeek > 0) {
      alerts.push({ type: 'warning', message: `${hearingsThisWeek} hearing(s) scheduled this week` });
    }
    if (thisMonthCases > lastMonthCases && lastMonthCases > 0) {
      alerts.push({ type: 'info', message: `New cases up ${comparisonVsLastMonth.percentChange}% vs last month` });
    }

    // Top cases by value
    const topCases = allCases
      .filter(c => c.value)
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 5)
      .map(c => ({ name: c.title, value: Number(c.value), subtitle: c.status }));

    // Status breakdown
    const statusBreakdown = totalByStatus.map((s) => ({ name: s.status, value: s._count.id }));

    // Average case duration (for closed cases)
    const closedCases = allCases.filter(c => ['arquivado', 'encerrado', 'won', 'lost', 'settled'].includes(c.status) && c.filingDate);
    const avgCaseDuration = closedCases.length > 0
      ? Math.round(closedCases.reduce((sum, c) => {
          const start = c.filingDate || c.createdAt;
          return sum + (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / closedCases.length)
      : 0;

    // Task completion rate
    const completedTasksCount = allTasks.filter(t => t.status === 'concluida' || t.status === 'completed').length;
    const taskCompletionRate = allTasks.length > 0 ? Math.round((completedTasksCount / allTasks.length) * 100) : 0;

    // Total billing this month
    const totalBillingThisMonth = Number(thisMonthBillings._sum.amount || 0);

    return {
      totalCases,
      casesByStatus: totalByStatus.map((s) => ({ status: s.status, count: s._count.id })),
      upcomingHearings,
      overdueTasks,
      casesByMonth,
      comparisonVsLastMonth,
      alerts,
      topCases,
      statusBreakdown,
      avgCaseDuration,
      taskCompletionRate,
      totalBillingThisMonth,
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAestheticAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAestheticAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AestheticAppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    clientId?: string,
    procedureId?: string,
    status?: string,
    date?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (clientId) where.clientId = clientId;
    if (procedureId) where.procedureId = procedureId;
    if (status) where.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.appointmentDate = { gte: start, lt: end };
    }
    const [data, total] = await Promise.all([
      this.prisma.aestheticAppointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appointmentDate: 'asc' },
        include: { client: true, procedure: true },
      }),
      this.prisma.aestheticAppointment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const appointment = await this.prisma.aestheticAppointment.findFirst({
      where: { id, tenantId },
      include: { client: true, procedure: true },
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado');
    return appointment;
  }

  async create(tenantId: string, dto: CreateAestheticAppointmentDto) {
    const client = await this.prisma.aestheticClient.findFirst({ where: { id: dto.clientId, tenantId } });
    if (!client) throw new BadRequestException('Cliente não encontrado');

    const procedure = await this.prisma.aestheticProcedure.findFirst({ where: { id: dto.procedureId, tenantId } });
    if (!procedure) throw new BadRequestException('Procedimento não encontrado');

    return this.prisma.aestheticAppointment.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        procedureId: dto.procedureId,
        packageId: dto.packageId,
        appointmentDate: new Date(dto.appointmentDate),
        sessionNumber: dto.sessionNumber,
        status: dto.status || 'SCHEDULED',
        beforePhoto: dto.beforePhoto,
        afterPhoto: dto.afterPhoto,
        notes: dto.notes,
        professional: dto.professional,
        productsUsed: dto.productsUsed,
      },
      include: { client: true, procedure: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateAestheticAppointmentDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.appointmentDate) data.appointmentDate = new Date(dto.appointmentDate);
    return this.prisma.aestheticAppointment.update({
      where: { id },
      data,
      include: { client: true, procedure: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.aestheticAppointment.delete({ where: { id } });
  }

  async dashboard(tenantId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      todayAppointments,
      monthlyBillings,
      lastMonthBillings,
      popularProcedures,
      newClientsThisMonth,
      paidBillingsLast30,
      overdueBillings,
      allPackages,
      allAppointments,
      appointmentsByStatusGroup,
      totalClients,
    ] = await Promise.all([
      this.prisma.aestheticAppointment.findMany({
        where: {
          tenantId,
          appointmentDate: { gte: startOfDay, lt: endOfDay },
        },
        include: { client: true, procedure: true },
        orderBy: { appointmentDate: 'asc' },
      }),

      this.prisma.aestheticBilling.aggregate({
        where: {
          tenantId,
          status: 'PAID',
          paidAt: { gte: startOfMonth, lt: endOfMonth },
        },
        _sum: { amount: true },
      }),

      this.prisma.aestheticBilling.aggregate({
        where: {
          tenantId,
          status: 'PAID',
          paidAt: { gte: lastMonthStart, lt: lastMonthEnd },
        },
        _sum: { amount: true },
      }),

      this.prisma.aestheticAppointment.groupBy({
        by: ['procedureId'],
        where: {
          tenantId,
          appointmentDate: { gte: startOfMonth, lt: endOfMonth },
        },
        _count: { procedureId: true },
        orderBy: { _count: { procedureId: 'desc' } },
        take: 5,
      }),

      this.prisma.aestheticClient.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth, lt: endOfMonth },
        },
      }),

      this.prisma.aestheticBilling.findMany({
        where: { tenantId, status: 'PAID', paidAt: { gte: thirtyDaysAgo } },
        select: { amount: true, paidAt: true },
      }),

      this.prisma.aestheticBilling.count({
        where: { tenantId, status: 'overdue' },
      }),

      this.prisma.aestheticPackage.findMany({
        where: { tenantId, isActive: true },
        select: { id: true, totalSessions: true, validityDays: true, createdAt: true },
      }),

      this.prisma.aestheticAppointment.findMany({
        where: { tenantId },
        select: { clientId: true, packageId: true, sessionNumber: true, status: true },
      }),

      this.prisma.aestheticAppointment.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),

      this.prisma.aestheticClient.count({ where: { tenantId } }),
    ]);

    const procedureIds = popularProcedures.map((p) => p.procedureId);
    const procedures = procedureIds.length
      ? await this.prisma.aestheticProcedure.findMany({ where: { id: { in: procedureIds } } })
      : [];

    const popularProceduresWithNames = popularProcedures.map((p) => {
      const proc = procedures.find((pr) => pr.id === p.procedureId);
      return { procedureId: p.procedureId, name: proc?.name || 'N/A', count: p._count.procedureId };
    });

    // Revenue by day (last 30 days)
    const revenueByDayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      revenueByDayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const b of paidBillingsLast30) {
      if (b.paidAt) {
        const key = b.paidAt.toISOString().slice(0, 10);
        if (revenueByDayMap[key] !== undefined) {
          revenueByDayMap[key] += Number(b.amount);
        }
      }
    }
    const revenueByDay = Object.entries(revenueByDayMap).map(([date, value]) => ({ date, value }));

    // Comparison vs last month
    const currentRev = Number(monthlyBillings._sum.amount || 0);
    const previousRev = Number(lastMonthBillings._sum.amount || 0);
    const comparisonVsLastMonth = {
      current: currentRev,
      previous: previousRev,
      percentChange: previousRev > 0 ? Math.round(((currentRev - previousRev) / previousRev) * 100) : 0,
    };

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    if (overdueBillings > 0) {
      alerts.push({ type: 'critical', message: `${overdueBillings} overdue billing(s) require attention` });
    }
    const expiringPackages = allPackages.filter(p => {
      if (!p.validityDays) return false;
      const expiryDate = new Date(p.createdAt.getTime() + p.validityDays * 24 * 60 * 60 * 1000);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return expiryDate <= sevenDaysFromNow && expiryDate >= now;
    });
    if (expiringPackages.length > 0) {
      alerts.push({ type: 'warning', message: `${expiringPackages.length} package(s) expiring within 7 days` });
    }
    if (newClientsThisMonth > 0) {
      alerts.push({ type: 'info', message: `${newClientsThisMonth} new client(s) this month` });
    }

    // Top procedures (already computed as popularProceduresWithNames)
    const topProcedures = popularProceduresWithNames.map((p) => ({
      name: p.name,
      value: p.count,
      subtitle: 'appointments this month',
    }));

    // Status breakdown
    const statusBreakdown = appointmentsByStatusGroup.map((s) => ({ name: s.status, value: s._count.id }));

    // Package completion rate
    const packageAppointments = allAppointments.filter(a => a.packageId);
    const completedPackageSessions = packageAppointments.filter(a => a.status === 'completed').length;
    const packageCompletionRate = packageAppointments.length > 0
      ? Math.round((completedPackageSessions / packageAppointments.length) * 100)
      : 0;

    // Average sessions per client
    const clientSessionMap: Record<string, number> = {};
    for (const a of allAppointments) {
      if (a.status === 'completed') {
        clientSessionMap[a.clientId] = (clientSessionMap[a.clientId] || 0) + 1;
      }
    }
    const clientsWithSessions = Object.values(clientSessionMap);
    const avgSessionsPerClient = clientsWithSessions.length > 0
      ? Math.round((clientsWithSessions.reduce((s, v) => s + v, 0) / clientsWithSessions.length) * 10) / 10
      : 0;

    // Client retention rate (clients with 2+ completed appointments / total clients)
    const returningClients = clientsWithSessions.filter(c => c >= 2).length;
    const clientRetentionRate = totalClients > 0 ? Math.round((returningClients / totalClients) * 100) : 0;

    return {
      todayAppointments,
      monthlyRevenue: currentRev,
      popularProcedures: popularProceduresWithNames,
      newClientsThisMonth,
      revenueByDay,
      comparisonVsLastMonth,
      alerts,
      topProcedures,
      statusBreakdown,
      packageCompletionRate,
      avgSessionsPerClient,
      clientRetentionRate,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateClinicBillingDto } from './dto/create-clinic-billing.dto';
import { UpdateClinicBillingDto } from './dto/update-clinic-billing.dto';

@Injectable()
export class ClinicBillingService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.clinicBilling.findMany({
        where, skip, take: limit,
        include: { patient: { select: { name: true } }, appointment: { select: { appointmentDate: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.clinicBilling.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const billing = await this.prisma.clinicBilling.findFirst({
      where: { id, tenantId },
      include: { patient: true, appointment: true },
    });
    if (!billing) throw new NotFoundException('Billing not found');
    return billing;
  }

  async create(tenantId: string, dto: CreateClinicBillingDto) {
    return this.prisma.clinicBilling.create({
      data: {
        tenantId, patientId: dto.patientId, appointmentId: dto.appointmentId,
        amount: dto.amount, status: dto.status || 'pending',
        paymentMethod: dto.paymentMethod, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateClinicBillingDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.status === 'paid') data.paidAt = new Date();
    return this.prisma.clinicBilling.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.clinicBilling.delete({ where: { id } });
  }

  async getDashboard(tenantId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalPatients,
      todayAppointments,
      pendingBillings,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      overdueBillings,
      paidBillingsLast30,
      allAppointmentsThisMonth,
      canceledAppointmentsThisMonth,
      newPatientsThisMonth,
      appointmentsWithDoctors,
      billingsByStatus,
    ] = await Promise.all([
      this.prisma.clinicPatient.count({ where: { tenantId } }),
      this.prisma.clinicAppointment.count({
        where: { tenantId, appointmentDate: { gte: todayStart, lt: todayEnd } },
      }),
      this.prisma.clinicBilling.count({ where: { tenantId, status: 'pending' } }),
      this.prisma.clinicBilling.aggregate({ where: { tenantId, status: 'paid' }, _sum: { amount: true } }),
      this.prisma.clinicBilling.aggregate({
        where: { tenantId, status: 'paid', paidAt: { gte: thisMonthStart, lt: thisMonthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.clinicBilling.aggregate({
        where: { tenantId, status: 'paid', paidAt: { gte: lastMonthStart, lt: lastMonthEnd } },
        _sum: { amount: true },
      }),
      this.prisma.clinicBilling.findMany({
        where: { tenantId, status: 'overdue' },
        include: { patient: { select: { name: true } } },
        take: 10,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.clinicBilling.findMany({
        where: { tenantId, status: 'paid', paidAt: { gte: thirtyDaysAgo } },
        select: { amount: true, paidAt: true },
      }),
      this.prisma.clinicAppointment.count({
        where: { tenantId, appointmentDate: { gte: thisMonthStart, lt: thisMonthEnd } },
      }),
      this.prisma.clinicAppointment.count({
        where: { tenantId, status: 'canceled', appointmentDate: { gte: thisMonthStart, lt: thisMonthEnd } },
      }),
      this.prisma.clinicPatient.count({
        where: { tenantId, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } },
      }),
      this.prisma.clinicAppointment.findMany({
        where: { tenantId, appointmentDate: { gte: thisMonthStart, lt: thisMonthEnd } },
        select: { doctorId: true, doctor: { select: { name: true } } },
      }),
      this.prisma.clinicBilling.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),
    ]);

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
    const currentMonthRev = Number(thisMonthRevenue._sum.amount || 0);
    const previousMonthRev = Number(lastMonthRevenue._sum.amount || 0);
    const comparisonVsLastMonth = {
      current: currentMonthRev,
      previous: previousMonthRev,
      percentChange: previousMonthRev > 0 ? Math.round(((currentMonthRev - previousMonthRev) / previousMonthRev) * 100) : 0,
    };

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    if (overdueBillings.length > 0) {
      alerts.push({ type: 'critical', message: `${overdueBillings.length} overdue billing(s) require attention` });
    }
    if (pendingBillings > 10) {
      alerts.push({ type: 'warning', message: `${pendingBillings} pending billings awaiting payment` });
    }
    if (newPatientsThisMonth > 0) {
      alerts.push({ type: 'info', message: `${newPatientsThisMonth} new patient(s) registered this month` });
    }

    // Top doctors by appointment count
    const doctorCountMap: Record<string, { name: string; count: number }> = {};
    for (const appt of appointmentsWithDoctors) {
      if (!doctorCountMap[appt.doctorId]) {
        doctorCountMap[appt.doctorId] = { name: appt.doctor.name, count: 0 };
      }
      doctorCountMap[appt.doctorId].count++;
    }
    const topDoctors = Object.values(doctorCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((d) => ({ name: d.name, value: d.count, subtitle: 'appointments this month' }));

    // Status breakdown
    const statusBreakdown = billingsByStatus.map((s) => ({ name: s.status, value: s._count.id }));

    // No-show rate
    const noShowRate = allAppointmentsThisMonth > 0
      ? Math.round((canceledAppointmentsThisMonth / allAppointmentsThisMonth) * 100)
      : 0;

    return {
      totalPatients,
      todayAppointments,
      pendingBillings,
      totalRevenue: totalRevenue._sum.amount || 0,
      revenueByDay,
      comparisonVsLastMonth,
      alerts,
      topDoctors,
      statusBreakdown,
      noShowRate,
      newPatientsThisMonth,
    };
  }
}

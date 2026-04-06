import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDentalAppointmentDto } from './dto/create-appointment.dto';
import { UpdateDentalAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class DentalAppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    patientId?: string,
    dentistId?: string,
    date?: string,
    status?: string,
    type?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;
    if (dentistId) where.dentistId = dentistId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.appointmentDate = { gte: start, lt: end };
    }
    const [data, total] = await Promise.all([
      this.prisma.dentalAppointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appointmentDate: 'asc' },
        include: { patient: true, dentist: true },
      }),
      this.prisma.dentalAppointment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const appointment = await this.prisma.dentalAppointment.findFirst({
      where: { id, tenantId },
      include: { patient: true, dentist: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async create(tenantId: string, dto: CreateDentalAppointmentDto) {
    const patient = await this.prisma.dentalPatient.findFirst({ where: { id: dto.patientId, tenantId } });
    if (!patient) throw new BadRequestException('Patient not found');

    const dentist = await this.prisma.dentalDentist.findFirst({ where: { id: dto.dentistId, tenantId } });
    if (!dentist) throw new BadRequestException('Dentist not found');

    return this.prisma.dentalAppointment.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        dentistId: dto.dentistId,
        appointmentDate: new Date(dto.appointmentDate),
        duration: dto.duration,
        type: dto.type,
        status: dto.status || 'scheduled',
        toothNumber: dto.toothNumber,
        notes: dto.notes,
        clinicalNotes: dto.clinicalNotes,
      },
      include: { patient: true, dentist: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDentalAppointmentDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.appointmentDate) data.appointmentDate = new Date(dto.appointmentDate);

    if (dto.patientId) {
      const patient = await this.prisma.dentalPatient.findFirst({ where: { id: dto.patientId, tenantId } });
      if (!patient) throw new BadRequestException('Patient not found');
    }
    if (dto.dentistId) {
      const dentist = await this.prisma.dentalDentist.findFirst({ where: { id: dto.dentistId, tenantId } });
      if (!dentist) throw new BadRequestException('Dentist not found');
    }

    return this.prisma.dentalAppointment.update({
      where: { id },
      data,
      include: { patient: true, dentist: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dentalAppointment.delete({ where: { id } });
  }

  async getDashboard(tenantId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      todayAppointments,
      totalPatients,
      pendingTreatments,
      monthlyBillings,
      lastMonthBillings,
      paidBillingsLast30,
      overdueBillings,
      proposedPlans,
      allPlans,
      allPlanItems,
      appointmentsByType,
      appointmentsByStatusGroup,
    ] = await Promise.all([
      this.prisma.dentalAppointment.findMany({
        where: {
          tenantId,
          appointmentDate: { gte: today, lt: tomorrow },
        },
        include: { patient: true, dentist: true },
        orderBy: { appointmentDate: 'asc' },
      }),
      this.prisma.dentalPatient.count({ where: { tenantId } }),
      this.prisma.dentalTreatmentPlan.count({
        where: { tenantId, status: 'pending' },
      }),
      this.prisma.dentalBilling.findMany({
        where: {
          tenantId,
          status: 'paid',
          paidAt: { gte: firstDayOfMonth, lt: lastDayOfMonth },
        },
      }),
      this.prisma.dentalBilling.aggregate({
        where: {
          tenantId,
          status: 'paid',
          paidAt: { gte: lastMonthStart, lt: lastMonthEnd },
        },
        _sum: { amount: true },
      }),
      this.prisma.dentalBilling.findMany({
        where: { tenantId, status: 'paid', paidAt: { gte: thirtyDaysAgo } },
        select: { amount: true, paidAt: true },
      }),
      this.prisma.dentalBilling.count({
        where: { tenantId, status: 'overdue' },
      }),
      this.prisma.dentalTreatmentPlan.count({
        where: { tenantId, status: 'proposed' },
      }),
      this.prisma.dentalTreatmentPlan.findMany({
        where: { tenantId },
        select: { status: true },
      }),
      this.prisma.dentalTreatmentPlanItem.findMany({
        where: { plan: { tenantId } },
        select: { status: true, treatment: { select: { name: true } } },
      }),
      this.prisma.dentalAppointment.groupBy({
        by: ['type'],
        where: { tenantId, appointmentDate: { gte: firstDayOfMonth, lt: lastDayOfMonth } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      this.prisma.dentalAppointment.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),
    ]);

    const monthlyRevenue = monthlyBillings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

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
    const previousRev = Number(lastMonthBillings._sum.amount || 0);
    const comparisonVsLastMonth = {
      current: monthlyRevenue,
      previous: previousRev,
      percentChange: previousRev > 0 ? Math.round(((monthlyRevenue - previousRev) / previousRev) * 100) : 0,
    };

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    if (overdueBillings > 0) {
      alerts.push({ type: 'critical', message: `${overdueBillings} overdue billing(s) require attention` });
    }
    if (proposedPlans > 0) {
      alerts.push({ type: 'warning', message: `${proposedPlans} treatment plan(s) pending patient approval` });
    }
    if (todayAppointments.length > 0) {
      alerts.push({ type: 'info', message: `${todayAppointments.length} appointment(s) scheduled for today` });
    }

    // Top treatments by count (from plan items)
    const treatmentCountMap: Record<string, number> = {};
    for (const item of allPlanItems) {
      const name = item.treatment?.name || 'Unknown';
      treatmentCountMap[name] = (treatmentCountMap[name] || 0) + 1;
    }
    const topTreatments = Object.entries(treatmentCountMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value, subtitle: 'total prescriptions' }));

    // Status breakdown (appointment status)
    const statusBreakdown = appointmentsByStatusGroup.map((s) => ({ name: s.status, value: s._count.id }));

    // Plan acceptance rate (approved + in_progress + completed vs total)
    const acceptedPlans = allPlans.filter(p => ['approved', 'in_progress', 'completed'].includes(p.status)).length;
    const planAcceptanceRate = allPlans.length > 0 ? Math.round((acceptedPlans / allPlans.length) * 100) : 0;

    // Treatment completion rate
    const completedItems = allPlanItems.filter(i => i.status === 'completed').length;
    const treatmentCompletionRate = allPlanItems.length > 0 ? Math.round((completedItems / allPlanItems.length) * 100) : 0;

    // Average revenue per patient
    const patientsWithBilling = new Set(monthlyBillings.map(b => b.patientId));
    const avgRevenuePerPatient = patientsWithBilling.size > 0
      ? Math.round(monthlyRevenue / patientsWithBilling.size)
      : 0;

    return {
      todayAppointments,
      totalPatients,
      pendingTreatments,
      monthlyRevenue,
      revenueByDay,
      comparisonVsLastMonth,
      alerts,
      topTreatments,
      statusBreakdown,
      planAcceptanceRate,
      treatmentCompletionRate,
      avgRevenuePerPatient,
    };
  }
}

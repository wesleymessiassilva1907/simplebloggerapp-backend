import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateNutritionAppointmentDto } from './dto/create-appointment.dto';
import { UpdateNutritionAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class NutritionAppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, patientId?: string, date?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.appointmentDate = { gte: start, lt: end };
    }
    const [data, total] = await Promise.all([
      this.prisma.nutritionAppointment.findMany({ where, skip, take: limit, orderBy: { appointmentDate: 'desc' }, include: { patient: true } }),
      this.prisma.nutritionAppointment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const appointment = await this.prisma.nutritionAppointment.findFirst({ where: { id, tenantId }, include: { patient: true } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async create(tenantId: string, dto: CreateNutritionAppointmentDto) {
    const patient = await this.prisma.nutritionPatient.findFirst({ where: { id: dto.patientId, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.prisma.nutritionAppointment.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        appointmentDate: new Date(dto.appointmentDate),
        type: dto.type,
        status: dto.status || 'scheduled',
        weight: dto.weight,
        notes: dto.notes,
        recommendations: dto.recommendations,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateNutritionAppointmentDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.appointmentDate) data.appointmentDate = new Date(dto.appointmentDate);
    return this.prisma.nutritionAppointment.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.nutritionAppointment.delete({ where: { id } });
  }

  async getDashboard(tenantId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalPatients,
      todayAppointments,
      activePlans,
      recentMeasurements,
      monthlyAppointments,
      lastMonthAppointments,
      appointmentsLast30,
      allPlans,
      patientsWithoutRecentMeasurement,
      overdueFollowUps,
      appointmentsWithPatients,
      appointmentsByStatus,
      allMeasurements,
    ] = await Promise.all([
      this.prisma.nutritionPatient.count({ where: { tenantId } }),
      this.prisma.nutritionAppointment.count({
        where: { tenantId, appointmentDate: { gte: todayStart, lt: todayEnd } },
      }),
      this.prisma.nutritionPlan.count({ where: { tenantId, status: 'active' } }),
      this.prisma.nutritionMeasurement.count({ where: { tenantId, date: { gte: startOfMonth } } }),
      this.prisma.nutritionAppointment.count({ where: { tenantId, appointmentDate: { gte: startOfMonth, lt: endOfMonth } } }),
      this.prisma.nutritionAppointment.count({ where: { tenantId, appointmentDate: { gte: lastMonthStart, lt: lastMonthEnd } } }),
      this.prisma.nutritionAppointment.findMany({
        where: { tenantId, appointmentDate: { gte: thirtyDaysAgo } },
        select: { appointmentDate: true },
      }),
      this.prisma.nutritionPlan.findMany({
        where: { tenantId },
        select: { status: true },
      }),
      this.prisma.nutritionPatient.count({
        where: {
          tenantId,
          measurements: { none: { date: { gte: sixtyDaysAgo } } },
          appointments: { some: {} },
        },
      }),
      this.prisma.nutritionAppointment.count({
        where: {
          tenantId,
          type: 'follow_up',
          status: 'scheduled',
          appointmentDate: { lt: now },
        },
      }),
      this.prisma.nutritionAppointment.findMany({
        where: { tenantId, appointmentDate: { gte: startOfMonth, lt: endOfMonth } },
        select: { patientId: true, patient: { select: { name: true } } },
      }),
      this.prisma.nutritionAppointment.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),
      this.prisma.nutritionMeasurement.findMany({
        where: { tenantId },
        select: { patientId: true, weight: true, date: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Appointments by day (last 30 days)
    const appointmentsByDayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      appointmentsByDayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const a of appointmentsLast30) {
      const key = a.appointmentDate.toISOString().slice(0, 10);
      if (appointmentsByDayMap[key] !== undefined) {
        appointmentsByDayMap[key]++;
      }
    }
    const appointmentsByDay = Object.entries(appointmentsByDayMap).map(([date, value]) => ({ date, value }));

    // Comparison vs last month
    const comparisonVsLastMonth = {
      current: monthlyAppointments,
      previous: lastMonthAppointments,
      percentChange: lastMonthAppointments > 0 ? Math.round(((monthlyAppointments - lastMonthAppointments) / lastMonthAppointments) * 100) : 0,
    };

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    if (patientsWithoutRecentMeasurement > 0) {
      alerts.push({ type: 'warning', message: `${patientsWithoutRecentMeasurement} patient(s) without measurements in 60 days` });
    }
    if (overdueFollowUps > 0) {
      alerts.push({ type: 'critical', message: `${overdueFollowUps} overdue follow-up appointment(s)` });
    }
    if (todayAppointments > 0) {
      alerts.push({ type: 'info', message: `${todayAppointments} appointment(s) scheduled for today` });
    }

    // Top patients (most appointments this month)
    const patientCountMap: Record<string, { name: string; count: number }> = {};
    for (const a of appointmentsWithPatients) {
      if (!patientCountMap[a.patientId]) {
        patientCountMap[a.patientId] = { name: a.patient.name, count: 0 };
      }
      patientCountMap[a.patientId].count++;
    }
    const topPatients = Object.values(patientCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((p) => ({ name: p.name, value: p.count, subtitle: 'appointments this month' }));

    // Status breakdown (plan status)
    const planStatusMap: Record<string, number> = {};
    for (const p of allPlans) {
      planStatusMap[p.status] = (planStatusMap[p.status] || 0) + 1;
    }
    const statusBreakdown = Object.entries(planStatusMap).map(([name, value]) => ({ name, value }));

    // Average weight change for patients with 2+ measurements
    const measurementsByPatient: Record<string, { weight: number; date: Date }[]> = {};
    for (const m of allMeasurements) {
      if (!measurementsByPatient[m.patientId]) measurementsByPatient[m.patientId] = [];
      measurementsByPatient[m.patientId].push({ weight: Number(m.weight), date: m.date });
    }
    let totalWeightChange = 0;
    let patientsWithChange = 0;
    for (const records of Object.values(measurementsByPatient)) {
      if (records.length >= 2) {
        const first = records[0];
        const last = records[records.length - 1];
        totalWeightChange += last.weight - first.weight;
        patientsWithChange++;
      }
    }
    const avgWeightChange = patientsWithChange > 0 ? Math.round((totalWeightChange / patientsWithChange) * 10) / 10 : 0;

    // Plan completion rate
    const completedPlans = allPlans.filter(p => p.status === 'completed').length;
    const planCompletionRate = allPlans.length > 0 ? Math.round((completedPlans / allPlans.length) * 100) : 0;

    return {
      totalPatients,
      todayAppointments,
      activePlans,
      recentMeasurements,
      monthlyAppointments,
      appointmentsByDay,
      comparisonVsLastMonth,
      alerts,
      topPatients,
      statusBreakdown,
      avgWeightChange,
      planCompletionRate,
    };
  }
}

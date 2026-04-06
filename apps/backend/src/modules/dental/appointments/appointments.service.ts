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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [todayAppointments, totalPatients, pendingTreatments, monthlyBillings] = await Promise.all([
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
          paidAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
      }),
    ]);

    const monthlyRevenue = monthlyBillings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    return {
      todayAppointments,
      totalPatients,
      pendingTreatments,
      monthlyRevenue,
    };
  }
}

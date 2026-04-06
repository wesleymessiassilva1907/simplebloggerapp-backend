import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, doctorId?: string, status?: string, date?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.appointmentDate = { gte: d, lt: nextDay };
    }
    const [data, total] = await Promise.all([
      this.prisma.clinicAppointment.findMany({
        where, skip, take: limit,
        include: { patient: { select: { name: true } }, doctor: { select: { name: true, specialty: true } } },
        orderBy: { appointmentDate: 'asc' },
      }),
      this.prisma.clinicAppointment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const appointment = await this.prisma.clinicAppointment.findFirst({
      where: { id, tenantId },
      include: { patient: true, doctor: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async create(tenantId: string, dto: CreateAppointmentDto) {
    const patient = await this.prisma.clinicPatient.findFirst({ where: { id: dto.patientId, tenantId } });
    if (!patient) throw new BadRequestException('Invalid patient');
    const doctor = await this.prisma.clinicDoctor.findFirst({ where: { id: dto.doctorId, tenantId } });
    if (!doctor) throw new BadRequestException('Invalid doctor');
    return this.prisma.clinicAppointment.create({
      data: { tenantId, patientId: dto.patientId, doctorId: dto.doctorId, appointmentDate: new Date(dto.appointmentDate), status: dto.status || 'scheduled', notes: dto.notes },
      include: { patient: { select: { name: true } }, doctor: { select: { name: true } } },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateAppointmentDto) {
    await this.findOne(id, tenantId);
    const data: any = {};
    if (dto.appointmentDate) data.appointmentDate = new Date(dto.appointmentDate);
    if (dto.status) data.status = dto.status;
    if (dto.notes !== undefined) data.notes = dto.notes;
    return this.prisma.clinicAppointment.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.clinicAppointment.delete({ where: { id } });
  }
}

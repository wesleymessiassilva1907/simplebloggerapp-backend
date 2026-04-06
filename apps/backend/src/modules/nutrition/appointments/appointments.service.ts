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
}

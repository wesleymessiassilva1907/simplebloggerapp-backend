import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDentalTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdateDentalTreatmentPlanDto } from './dto/update-treatment-plan.dto';

@Injectable()
export class DentalTreatmentPlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, patientId?: string, dentistId?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;
    if (dentistId) where.dentistId = dentistId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.dentalTreatmentPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { patient: true, dentist: true, items: { include: { treatment: true } } },
      }),
      this.prisma.dentalTreatmentPlan.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const plan = await this.prisma.dentalTreatmentPlan.findFirst({
      where: { id, tenantId },
      include: { patient: true, dentist: true, items: { include: { treatment: true } } },
    });
    if (!plan) throw new NotFoundException('Treatment plan not found');
    return plan;
  }

  async create(tenantId: string, dto: CreateDentalTreatmentPlanDto) {
    const patient = await this.prisma.dentalPatient.findFirst({ where: { id: dto.patientId, tenantId } });
    if (!patient) throw new BadRequestException('Patient not found');

    const dentist = await this.prisma.dentalDentist.findFirst({ where: { id: dto.dentistId, tenantId } });
    if (!dentist) throw new BadRequestException('Dentist not found');

    const totalCost = dto.items.reduce((sum, item) => sum + item.price * (item.sessions || 1), 0);

    return this.prisma.dentalTreatmentPlan.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        dentistId: dto.dentistId,
        name: dto.name,
        description: dto.description,
        status: dto.status || 'pending',
        totalCost,
        discount: dto.discount || 0,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            treatmentId: item.treatmentId,
            toothNumber: item.toothNumber,
            status: 'pending',
            price: item.price,
            sessions: item.sessions || 1,
            notes: item.notes,
          })),
        },
      },
      include: { patient: true, dentist: true, items: { include: { treatment: true } } },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDentalTreatmentPlanDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    if (dto.patientId) {
      const patient = await this.prisma.dentalPatient.findFirst({ where: { id: dto.patientId, tenantId } });
      if (!patient) throw new BadRequestException('Patient not found');
    }
    if (dto.dentistId) {
      const dentist = await this.prisma.dentalDentist.findFirst({ where: { id: dto.dentistId, tenantId } });
      if (!dentist) throw new BadRequestException('Dentist not found');
    }

    return this.prisma.dentalTreatmentPlan.update({
      where: { id },
      data,
      include: { patient: true, dentist: true, items: { include: { treatment: true } } },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.dentalTreatmentPlanItem.deleteMany({ where: { planId: id } });
    return this.prisma.dentalTreatmentPlan.delete({ where: { id } });
  }
}

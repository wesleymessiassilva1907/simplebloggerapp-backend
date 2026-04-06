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
    const [totalPatients, todayAppointments, pendingBillings, totalRevenue] = await Promise.all([
      this.prisma.clinicPatient.count({ where: { tenantId } }),
      this.prisma.clinicAppointment.count({
        where: {
          tenantId,
          appointmentDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lt: new Date(new Date().setHours(23, 59, 59, 999)) },
        },
      }),
      this.prisma.clinicBilling.count({ where: { tenantId, status: 'pending' } }),
      this.prisma.clinicBilling.aggregate({ where: { tenantId, status: 'paid' }, _sum: { amount: true } }),
    ]);
    return { totalPatients, todayAppointments, pendingBillings, totalRevenue: totalRevenue._sum.amount || 0 };
  }
}

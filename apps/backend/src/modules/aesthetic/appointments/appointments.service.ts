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

    const [todayAppointments, monthlyBillings, popularProcedures, newClientsThisMonth] = await Promise.all([
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
    ]);

    const procedureIds = popularProcedures.map((p) => p.procedureId);
    const procedures = procedureIds.length
      ? await this.prisma.aestheticProcedure.findMany({ where: { id: { in: procedureIds } } })
      : [];

    const popularProceduresWithNames = popularProcedures.map((p) => {
      const proc = procedures.find((pr) => pr.id === p.procedureId);
      return { procedureId: p.procedureId, name: proc?.name || 'N/A', count: p._count.procedureId };
    });

    return {
      todayAppointments,
      monthlyRevenue: monthlyBillings._sum.amount || 0,
      popularProcedures: popularProceduresWithNames,
      newClientsThisMonth,
    };
  }
}

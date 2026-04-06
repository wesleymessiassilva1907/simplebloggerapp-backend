import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, barberId?: string, status?: string, date?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (barberId) where.barberId = barberId;
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.bookingDate = { gte: d, lt: nextDay };
    }
    const [data, total] = await Promise.all([
      this.prisma.barbershopBooking.findMany({
        where, skip, take: limit,
        include: {
          client: { select: { name: true, phone: true } },
          barber: { select: { name: true } },
          services: { include: { service: { select: { name: true } } } },
        },
        orderBy: { bookingDate: 'asc' },
      }),
      this.prisma.barbershopBooking.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const booking = await this.prisma.barbershopBooking.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        barber: true,
        services: { include: { service: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async create(tenantId: string, dto: CreateBookingDto) {
    const client = await this.prisma.barbershopClient.findFirst({ where: { id: dto.clientId, tenantId } });
    if (!client) throw new BadRequestException('Invalid client');
    const barber = await this.prisma.barbershopBarber.findFirst({ where: { id: dto.barberId, tenantId } });
    if (!barber) throw new BadRequestException('Invalid barber');

    let totalPrice = 0;
    let servicesData: { serviceId: string; price: number }[] = [];

    if (dto.serviceIds && dto.serviceIds.length > 0) {
      const services = await this.prisma.barbershopService.findMany({
        where: { id: { in: dto.serviceIds }, tenantId },
      });
      servicesData = services.map((s) => ({ serviceId: s.id, price: Number(s.price) }));
      totalPrice = servicesData.reduce((sum, s) => sum + s.price, 0);
    }

    return this.prisma.barbershopBooking.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        barberId: dto.barberId,
        bookingDate: new Date(dto.bookingDate),
        status: dto.status || 'scheduled',
        notes: dto.notes,
        totalPrice,
        services: {
          create: servicesData,
        },
      },
      include: {
        client: { select: { name: true } },
        barber: { select: { name: true } },
        services: { include: { service: { select: { name: true } } } },
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateBookingDto) {
    await this.findOne(id, tenantId);
    const data: any = {};
    if (dto.bookingDate) data.bookingDate = new Date(dto.bookingDate);
    if (dto.status) data.status = dto.status;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.barberId) data.barberId = dto.barberId;
    if (dto.clientId) data.clientId = dto.clientId;
    return this.prisma.barbershopBooking.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.barbershopBooking.delete({ where: { id } });
  }

  async getDashboard(tenantId: string) {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);

    const [todayBookings, totalClients, activeBarbers, monthRevenue] = await Promise.all([
      this.prisma.barbershopBooking.count({
        where: { tenantId, bookingDate: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.barbershopClient.count({ where: { tenantId } }),
      this.prisma.barbershopBarber.count({ where: { tenantId, isActive: true } }),
      this.prisma.barbershopOrder.aggregate({
        where: { tenantId, status: 'paid', paidAt: { gte: monthStart, lte: monthEnd } },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      todayBookings,
      totalClients,
      activeBarbers,
      monthRevenue: monthRevenue._sum.totalAmount || 0,
    };
  }
}

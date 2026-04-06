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
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      todayBookings,
      totalClients,
      activeBarbers,
      monthRevenue,
      lastMonthRevenue,
      paidOrdersLast30,
      lowStockProducts,
      monthBookings,
      noShowBookings,
      newClientsThisMonth,
      bookingsWithBarbers,
      bookingsByStatus,
      monthPaidOrders,
    ] = await Promise.all([
      this.prisma.barbershopBooking.count({
        where: { tenantId, bookingDate: { gte: todayStart, lt: todayEnd } },
      }),
      this.prisma.barbershopClient.count({ where: { tenantId } }),
      this.prisma.barbershopBarber.count({ where: { tenantId, isActive: true } }),
      this.prisma.barbershopOrder.aggregate({
        where: { tenantId, status: 'paid', paidAt: { gte: monthStart, lt: monthEnd } },
        _sum: { totalAmount: true },
      }),
      this.prisma.barbershopOrder.aggregate({
        where: { tenantId, status: 'paid', paidAt: { gte: lastMonthStart, lt: lastMonthEnd } },
        _sum: { totalAmount: true },
      }),
      this.prisma.barbershopOrder.findMany({
        where: { tenantId, status: 'paid', paidAt: { gte: thirtyDaysAgo } },
        select: { totalAmount: true, paidAt: true },
      }),
      this.prisma.barbershopProduct.findMany({
        where: { tenantId, stock: { lte: 5 }, isActive: true },
        select: { name: true, stock: true },
      }),
      this.prisma.barbershopBooking.count({
        where: { tenantId, bookingDate: { gte: monthStart, lt: monthEnd } },
      }),
      this.prisma.barbershopBooking.count({
        where: { tenantId, status: 'no_show', bookingDate: { gte: monthStart, lt: monthEnd } },
      }),
      this.prisma.barbershopClient.count({
        where: { tenantId, createdAt: { gte: monthStart, lt: monthEnd } },
      }),
      this.prisma.barbershopBooking.findMany({
        where: { tenantId, bookingDate: { gte: monthStart, lt: monthEnd } },
        select: { barberId: true, barber: { select: { name: true } } },
      }),
      this.prisma.barbershopBooking.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      }),
      this.prisma.barbershopOrder.findMany({
        where: { tenantId, status: 'paid', paidAt: { gte: monthStart, lt: monthEnd } },
        select: { totalAmount: true },
      }),
    ]);

    // Revenue by day (last 30 days)
    const revenueByDayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      revenueByDayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of paidOrdersLast30) {
      if (o.paidAt) {
        const key = o.paidAt.toISOString().slice(0, 10);
        if (revenueByDayMap[key] !== undefined) {
          revenueByDayMap[key] += Number(o.totalAmount);
        }
      }
    }
    const revenueByDay = Object.entries(revenueByDayMap).map(([date, value]) => ({ date, value }));

    // Comparison vs last month
    const currentRev = Number(monthRevenue._sum.totalAmount || 0);
    const previousRev = Number(lastMonthRevenue._sum.totalAmount || 0);
    const comparisonVsLastMonth = {
      current: currentRev,
      previous: previousRev,
      percentChange: previousRev > 0 ? Math.round(((currentRev - previousRev) / previousRev) * 100) : 0,
    };

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    if (lowStockProducts.length > 0) {
      alerts.push({ type: 'warning', message: `${lowStockProducts.length} product(s) with low stock: ${lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}` });
    }
    if (noShowBookings > 0) {
      alerts.push({ type: 'warning', message: `${noShowBookings} no-show(s) this month` });
    }
    if (newClientsThisMonth > 0) {
      alerts.push({ type: 'info', message: `${newClientsThisMonth} new client(s) this month` });
    }

    // Top barbers by booking count
    const barberCountMap: Record<string, { name: string; count: number }> = {};
    for (const b of bookingsWithBarbers) {
      if (!barberCountMap[b.barberId]) {
        barberCountMap[b.barberId] = { name: b.barber.name, count: 0 };
      }
      barberCountMap[b.barberId].count++;
    }
    const topBarbers = Object.values(barberCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((b) => ({ name: b.name, value: b.count, subtitle: 'bookings this month' }));

    // Status breakdown
    const statusBreakdown = bookingsByStatus.map((s) => ({ name: s.status, value: s._count.id }));

    // No-show rate
    const noShowRate = monthBookings > 0 ? Math.round((noShowBookings / monthBookings) * 100) : 0;

    // Average ticket
    const avgTicket = monthPaidOrders.length > 0
      ? Math.round(monthPaidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0) / monthPaidOrders.length)
      : 0;

    return {
      todayBookings,
      totalClients,
      activeBarbers,
      monthRevenue: currentRev,
      revenueByDay,
      comparisonVsLastMonth,
      alerts,
      topBarbers,
      statusBreakdown,
      noShowRate,
      avgTicket,
      newClientsThisMonth,
    };
  }
}

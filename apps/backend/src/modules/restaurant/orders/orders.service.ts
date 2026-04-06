import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRestaurantOrderDto } from './dto/create-order.dto';
import { UpdateRestaurantOrderDto } from './dto/update-order.dto';

const STATUS_WORKFLOW: Record<string, string[]> = {
  pending: ['confirmed', 'canceled'],
  confirmed: ['preparing', 'canceled'],
  preparing: ['ready', 'canceled'],
  ready: ['delivering', 'canceled'],
  delivering: ['delivered'],
  delivered: [],
  canceled: [],
};

@Injectable()
export class RestaurantOrdersService {
  constructor(private prisma: PrismaService) {}

  private generateOrderNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${dateStr}-${randomSuffix}`;
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    filters?: { status?: string; channel?: string; dateFrom?: string; dateTo?: string },
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.channel) where.channel = filters.channel;
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
    }

    const [data, total] = await Promise.all([
      this.prisma.restaurantOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, driver: true },
      }),
      this.prisma.restaurantOrder.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const order = await this.prisma.restaurantOrder.findFirst({
      where: { id, tenantId },
      include: { items: true, driver: true },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async create(tenantId: string, dto: CreateRestaurantOrderDto) {
    const orderNumber = this.generateOrderNumber();

    // Fetch menu items to get prices and names
    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.restaurantMenuItem.findMany({
      where: { id: { in: menuItemIds }, tenantId },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('Um ou mais itens do cardápio não foram encontrados');
    }

    const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));

    const orderItems = dto.items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId);
      const unitPrice = menuItem.isPromotion && menuItem.promotionPrice
        ? Number(menuItem.promotionPrice)
        : Number(menuItem.price);
      return {
        menuItemId: item.menuItemId,
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice,
        total: unitPrice * item.quantity,
        notes: item.notes,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = dto.deliveryFee || 0;
    const discount = dto.discount || 0;
    const total = subtotal + deliveryFee - discount;

    return this.prisma.restaurantOrder.create({
      data: {
        tenantId,
        orderNumber,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerAddress: dto.customerAddress,
        channel: dto.channel,
        status: 'pending',
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod: dto.paymentMethod,
        paymentStatus: 'pending',
        driverId: dto.driverId,
        notes: dto.notes,
        estimatedTime: dto.estimatedTime,
        items: { create: orderItems },
      },
      include: { items: true, driver: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateRestaurantOrderDto) {
    await this.findOne(id, tenantId);
    return this.prisma.restaurantOrder.update({
      where: { id },
      data: dto,
      include: { items: true, driver: true },
    });
  }

  async updateStatus(id: string, tenantId: string, newStatus: string) {
    const order = await this.findOne(id, tenantId);
    const allowedStatuses = STATUS_WORKFLOW[order.status];

    if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: ${order.status} -> ${newStatus}. Status permitidos: ${allowedStatuses?.join(', ') || 'nenhum'}`,
      );
    }

    return this.prisma.restaurantOrder.update({
      where: { id },
      data: { status: newStatus },
      include: { items: true, driver: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.restaurantOrder.delete({ where: { id } });
  }

  async dashboard(tenantId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const whereToday = {
      tenantId,
      createdAt: { gte: startOfDay, lt: endOfDay },
    };

    const [
      todayOrders,
      allTodayOrders,
      ordersByChannel,
      ordersByStatus,
      thisMonthRevenue,
      lastMonthRevenue,
      ordersLast30Days,
      pendingOldOrders,
      unavailableDrivers,
      todayOrderItems,
      deliveredTodayOrders,
      canceledThisMonth,
      totalThisMonth,
    ] = await Promise.all([
      this.prisma.restaurantOrder.aggregate({
        where: whereToday,
        _count: { id: true },
        _sum: { total: true },
        _avg: { total: true },
      }),
      this.prisma.restaurantOrder.findMany({
        where: whereToday,
        select: { channel: true, status: true, total: true },
      }),
      this.prisma.restaurantOrder.groupBy({
        by: ['channel'],
        where: whereToday,
        _count: { id: true },
        _sum: { total: true },
      }),
      this.prisma.restaurantOrder.groupBy({
        by: ['status'],
        where: whereToday,
        _count: { id: true },
      }),
      this.prisma.restaurantOrder.aggregate({
        where: { tenantId, createdAt: { gte: thisMonthStart, lt: thisMonthEnd }, status: { not: 'canceled' } },
        _sum: { total: true },
      }),
      this.prisma.restaurantOrder.aggregate({
        where: { tenantId, createdAt: { gte: lastMonthStart, lt: lastMonthEnd }, status: { not: 'canceled' } },
        _sum: { total: true },
      }),
      this.prisma.restaurantOrder.findMany({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo }, status: { not: 'canceled' } },
        select: { total: true, createdAt: true },
      }),
      this.prisma.restaurantOrder.count({
        where: { tenantId, status: 'pending', createdAt: { lt: thirtyMinAgo } },
      }),
      this.prisma.restaurantDriver.count({
        where: { tenantId, status: { in: ['offline'] } },
      }),
      this.prisma.restaurantOrderItem.findMany({
        where: { tenantId, order: { createdAt: { gte: startOfDay, lt: endOfDay } } },
        select: { name: true, quantity: true },
      }),
      this.prisma.restaurantOrder.findMany({
        where: { tenantId, status: 'delivered', createdAt: { gte: startOfDay, lt: endOfDay } },
        select: { createdAt: true, deliveredAt: true },
      }),
      this.prisma.restaurantOrder.count({
        where: { tenantId, status: 'canceled', createdAt: { gte: thisMonthStart, lt: thisMonthEnd } },
      }),
      this.prisma.restaurantOrder.count({
        where: { tenantId, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } },
      }),
    ]);

    // Revenue by day (last 30 days)
    const revenueByDayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      revenueByDayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of ordersLast30Days) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (revenueByDayMap[key] !== undefined) {
        revenueByDayMap[key] += Number(o.total);
      }
    }
    const revenueByDay = Object.entries(revenueByDayMap).map(([date, value]) => ({ date, value }));

    // Comparison vs last month
    const currentRev = Number(thisMonthRevenue._sum.total || 0);
    const previousRev = Number(lastMonthRevenue._sum.total || 0);
    const comparisonVsLastMonth = {
      current: currentRev,
      previous: previousRev,
      percentChange: previousRev > 0 ? Math.round(((currentRev - previousRev) / previousRev) * 100) : 0,
    };

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    if (pendingOldOrders > 0) {
      alerts.push({ type: 'critical', message: `${pendingOldOrders} order(s) pending for over 30 minutes` });
    }
    if (unavailableDrivers > 0) {
      alerts.push({ type: 'warning', message: `${unavailableDrivers} driver(s) currently offline` });
    }
    const todayTotal = todayOrders._count.id || 0;
    if (todayTotal > 0) {
      alerts.push({ type: 'info', message: `${todayTotal} order(s) received today` });
    }

    // Top menu items by quantity sold today
    const itemQuantityMap: Record<string, number> = {};
    for (const item of todayOrderItems) {
      itemQuantityMap[item.name] = (itemQuantityMap[item.name] || 0) + item.quantity;
    }
    const topMenuItems = Object.entries(itemQuantityMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value, subtitle: 'units sold today' }));

    // Status breakdown (today)
    const statusBreakdown = ordersByStatus.map((s) => ({ name: s.status, value: s._count.id }));

    // Average delivery time (today's delivered orders)
    let avgDeliveryTime = 0;
    if (deliveredTodayOrders.length > 0) {
      const totalMinutes = deliveredTodayOrders.reduce((sum, o) => {
        if (o.deliveredAt && o.createdAt) {
          return sum + (o.deliveredAt.getTime() - o.createdAt.getTime()) / 60000;
        }
        return sum;
      }, 0);
      avgDeliveryTime = Math.round(totalMinutes / deliveredTodayOrders.length);
    }

    // Cancel rate this month
    const cancelRate = totalThisMonth > 0 ? Math.round((canceledThisMonth / totalThisMonth) * 100) : 0;

    // Channel breakdown (today)
    const channelBreakdown = ordersByChannel.map((c) => ({
      name: c.channel,
      value: c._count.id,
    }));

    return {
      today: {
        totalOrders: todayOrders._count.id || 0,
        revenue: Number(todayOrders._sum.total || 0),
        averageTicket: Number(todayOrders._avg.total || 0),
      },
      ordersByChannel: ordersByChannel.map((c) => ({
        channel: c.channel,
        count: c._count.id,
        revenue: Number(c._sum.total || 0),
      })),
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      revenueByDay,
      comparisonVsLastMonth,
      alerts,
      topMenuItems,
      statusBreakdown,
      avgDeliveryTime,
      cancelRate,
      channelBreakdown,
    };
  }
}

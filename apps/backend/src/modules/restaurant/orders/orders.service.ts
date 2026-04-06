import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRestaurantOrderDto } from './dto/create-order.dto';
import { UpdateRestaurantOrderDto } from './dto/update-order.dto';

const STATUS_WORKFLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering', 'cancelled'],
  delivering: ['delivered'],
  delivered: [],
  cancelled: [],
};

@Injectable()
export class RestaurantOrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const count = await this.prisma.restaurantOrder.count({
      where: {
        tenantId,
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `ORD-${dateStr}-${seq}`;
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
    const orderNumber = await this.generateOrderNumber(tenantId);

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
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const whereToday = {
      tenantId,
      createdAt: { gte: startOfDay, lt: endOfDay },
    };

    const [todayOrders, allTodayOrders, ordersByChannel, ordersByStatus] = await Promise.all([
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
    ]);

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
    };
  }
}

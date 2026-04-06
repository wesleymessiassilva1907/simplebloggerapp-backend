import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.barbershopOrder.findMany({
        where, skip, take: limit,
        include: {
          client: { select: { name: true } },
          barber: { select: { name: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.barbershopOrder.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const order = await this.prisma.barbershopOrder.findFirst({
      where: { id, tenantId },
      include: { client: true, barber: true, items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(tenantId: string, dto: CreateOrderDto) {
    return this.prisma.barbershopOrder.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        barberId: dto.barberId,
        totalAmount: dto.totalAmount,
        paymentMethod: dto.paymentMethod,
        status: dto.status || 'pending',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity || 1,
            price: item.price,
          })),
        },
      },
      include: {
        client: { select: { name: true } },
        barber: { select: { name: true } },
        items: true,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateOrderDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.status === 'paid') data.paidAt = new Date();
    return this.prisma.barbershopOrder.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.barbershopOrder.delete({ where: { id } });
  }
}

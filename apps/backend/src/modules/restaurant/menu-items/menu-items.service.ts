import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRestaurantMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateRestaurantMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class RestaurantMenuItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    filters?: { categoryId?: string; isAvailable?: boolean; isPromotion?: boolean },
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
    if (filters?.isPromotion !== undefined) where.isPromotion = filters.isPromotion;

    const [data, total] = await Promise.all([
      this.prisma.restaurantMenuItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: { category: true },
      }),
      this.prisma.restaurantMenuItem.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const item = await this.prisma.restaurantMenuItem.findFirst({
      where: { id, tenantId },
      include: { category: true },
    });
    if (!item) throw new NotFoundException('Item do cardápio não encontrado');
    return item;
  }

  async create(tenantId: string, dto: CreateRestaurantMenuItemDto) {
    return this.prisma.restaurantMenuItem.create({
      data: { tenantId, ...dto },
      include: { category: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateRestaurantMenuItemDto) {
    await this.findOne(id, tenantId);
    return this.prisma.restaurantMenuItem.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.restaurantMenuItem.delete({ where: { id } });
  }
}

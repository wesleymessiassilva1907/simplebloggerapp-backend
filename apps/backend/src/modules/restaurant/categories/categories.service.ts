import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRestaurantCategoryDto } from './dto/create-category.dto';
import { UpdateRestaurantCategoryDto } from './dto/update-category.dto';

@Injectable()
export class RestaurantCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.restaurantCategory.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.restaurantCategory.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const category = await this.prisma.restaurantCategory.findFirst({ where: { id, tenantId } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }

  async create(tenantId: string, dto: CreateRestaurantCategoryDto) {
    return this.prisma.restaurantCategory.create({ data: { tenantId, ...dto } });
  }

  async update(id: string, tenantId: string, dto: UpdateRestaurantCategoryDto) {
    await this.findOne(id, tenantId);
    return this.prisma.restaurantCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.restaurantCategory.delete({ where: { id } });
  }
}

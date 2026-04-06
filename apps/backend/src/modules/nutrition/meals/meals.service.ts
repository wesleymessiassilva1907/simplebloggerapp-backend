import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateNutritionMealDto } from './dto/create-meal.dto';
import { UpdateNutritionMealDto } from './dto/update-meal.dto';

@Injectable()
export class NutritionMealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, planId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (planId) where.planId = planId;
    const [data, total] = await Promise.all([
      this.prisma.nutritionMeal.findMany({ where, skip, take: limit, orderBy: { sortOrder: 'asc' } }),
      this.prisma.nutritionMeal.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const meal = await this.prisma.nutritionMeal.findFirst({ where: { id, tenantId } });
    if (!meal) throw new NotFoundException('Meal not found');
    return meal;
  }

  async create(tenantId: string, dto: CreateNutritionMealDto) {
    return this.prisma.nutritionMeal.create({ data: { tenantId, ...dto } });
  }

  async update(id: string, tenantId: string, dto: UpdateNutritionMealDto) {
    await this.findOne(id, tenantId);
    return this.prisma.nutritionMeal.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.nutritionMeal.delete({ where: { id } });
  }
}

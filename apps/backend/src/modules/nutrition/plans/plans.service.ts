import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateNutritionPlanDto } from './dto/create-plan.dto';
import { UpdateNutritionPlanDto } from './dto/update-plan.dto';

@Injectable()
export class NutritionPlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, patientId?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.nutritionPlan.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { patient: true } }),
      this.prisma.nutritionPlan.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const plan = await this.prisma.nutritionPlan.findFirst({ where: { id, tenantId }, include: { patient: true, meals: { orderBy: { sortOrder: 'asc' } } } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(tenantId: string, dto: CreateNutritionPlanDto) {
    const data: any = { tenantId, ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.nutritionPlan.create({ data });
  }

  async update(id: string, tenantId: string, dto: UpdateNutritionPlanDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.nutritionPlan.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.nutritionPlan.delete({ where: { id } });
  }
}

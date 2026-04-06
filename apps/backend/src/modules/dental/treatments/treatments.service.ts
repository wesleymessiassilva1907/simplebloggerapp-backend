import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDentalTreatmentDto } from './dto/create-treatment.dto';
import { UpdateDentalTreatmentDto } from './dto/update-treatment.dto';

@Injectable()
export class DentalTreatmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, category?: string, isActive?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    const [data, total] = await Promise.all([
      this.prisma.dentalTreatment.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.dentalTreatment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const treatment = await this.prisma.dentalTreatment.findFirst({ where: { id, tenantId } });
    if (!treatment) throw new NotFoundException('Treatment not found');
    return treatment;
  }

  async create(tenantId: string, dto: CreateDentalTreatmentDto) {
    return this.prisma.dentalTreatment.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        duration: dto.duration,
        price: dto.price,
        toothRelated: dto.toothRelated ?? false,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDentalTreatmentDto) {
    await this.findOne(id, tenantId);
    return this.prisma.dentalTreatment.update({ where: { id }, data: dto as any });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dentalTreatment.delete({ where: { id } });
  }
}

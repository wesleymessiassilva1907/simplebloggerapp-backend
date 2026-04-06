import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateNutritionPatientDto } from './dto/create-patient.dto';
import { UpdateNutritionPatientDto } from './dto/update-patient.dto';

@Injectable()
export class NutritionPatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.nutritionPatient.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.nutritionPatient.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const patient = await this.prisma.nutritionPatient.findFirst({ where: { id, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async create(tenantId: string, dto: CreateNutritionPatientDto) {
    const data: any = { tenantId, ...dto };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    return this.prisma.nutritionPatient.create({ data });
  }

  async update(id: string, tenantId: string, dto: UpdateNutritionPatientDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    return this.prisma.nutritionPatient.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.nutritionPatient.delete({ where: { id } });
  }
}

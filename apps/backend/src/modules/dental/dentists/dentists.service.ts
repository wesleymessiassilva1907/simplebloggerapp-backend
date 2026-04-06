import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDentalDentistDto } from './dto/create-dentist.dto';
import { UpdateDentalDentistDto } from './dto/update-dentist.dto';

@Injectable()
export class DentalDentistsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    const [data, total] = await Promise.all([
      this.prisma.dentalDentist.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.dentalDentist.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const dentist = await this.prisma.dentalDentist.findFirst({ where: { id, tenantId } });
    if (!dentist) throw new NotFoundException('Dentist not found');
    return dentist;
  }

  async create(tenantId: string, dto: CreateDentalDentistDto) {
    return this.prisma.dentalDentist.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cro: dto.cro,
        specialty: dto.specialty,
        workDays: dto.workDays,
        workHours: dto.workHours,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDentalDentistDto) {
    await this.findOne(id, tenantId);
    return this.prisma.dentalDentist.update({ where: { id }, data: dto as any });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dentalDentist.delete({ where: { id } });
  }
}

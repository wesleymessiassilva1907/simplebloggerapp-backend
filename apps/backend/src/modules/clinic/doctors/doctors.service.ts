import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.clinicDoctor.findMany({ where: { tenantId }, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.clinicDoctor.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const doctor = await this.prisma.clinicDoctor.findFirst({ where: { id, tenantId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async create(tenantId: string, dto: CreateDoctorDto) {
    return this.prisma.clinicDoctor.create({ data: { tenantId, ...dto } });
  }

  async update(id: string, tenantId: string, dto: UpdateDoctorDto) {
    await this.findOne(id, tenantId);
    return this.prisma.clinicDoctor.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.clinicDoctor.delete({ where: { id } });
  }
}

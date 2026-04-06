import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.clinicPatient.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.clinicPatient.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const patient = await this.prisma.clinicPatient.findFirst({ where: { id, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async create(tenantId: string, dto: CreatePatientDto) {
    return this.prisma.clinicPatient.create({ data: { tenantId, ...dto } });
  }

  async update(id: string, tenantId: string, dto: UpdatePatientDto) {
    await this.findOne(id, tenantId);
    return this.prisma.clinicPatient.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.clinicPatient.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDentalPatientDto } from './dto/create-patient.dto';
import { UpdateDentalPatientDto } from './dto/update-patient.dto';

@Injectable()
export class DentalPatientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.dentalPatient.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.dentalPatient.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const patient = await this.prisma.dentalPatient.findFirst({ where: { id, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async create(tenantId: string, dto: CreateDentalPatientDto) {
    const data: any = {
      tenantId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      cpf: dto.cpf,
      gender: dto.gender,
      address: dto.address,
      emergencyContact: dto.emergencyContact,
      medicalHistory: dto.medicalHistory,
      allergies: dto.allergies,
      notes: dto.notes,
    };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    return this.prisma.dentalPatient.create({ data });
  }

  async update(id: string, tenantId: string, dto: UpdateDentalPatientDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    return this.prisma.dentalPatient.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dentalPatient.delete({ where: { id } });
  }
}

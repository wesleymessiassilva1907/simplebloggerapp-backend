import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, patientId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;
    const [data, total] = await Promise.all([
      this.prisma.clinicMedicalRecord.findMany({
        where, skip, take: limit,
        include: { patient: { select: { name: true } }, doctor: { select: { name: true } }, attachment: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.clinicMedicalRecord.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const record = await this.prisma.clinicMedicalRecord.findFirst({
      where: { id, tenantId },
      include: { patient: true, doctor: true, appointment: true, attachment: true },
    });
    if (!record) throw new NotFoundException('Medical record not found');
    return record;
  }

  async create(tenantId: string, dto: CreateMedicalRecordDto) {
    return this.prisma.clinicMedicalRecord.create({
      data: { tenantId, patientId: dto.patientId, doctorId: dto.doctorId, appointmentId: dto.appointmentId, description: dto.description, diagnosis: dto.diagnosis, prescription: dto.prescription, attachmentId: dto.attachmentId },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateMedicalRecordDto) {
    await this.findOne(id, tenantId);
    return this.prisma.clinicMedicalRecord.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.clinicMedicalRecord.delete({ where: { id } });
  }
}

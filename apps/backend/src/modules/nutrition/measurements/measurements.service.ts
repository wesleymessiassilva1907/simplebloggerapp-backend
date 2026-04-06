import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateNutritionMeasurementDto } from './dto/create-measurement.dto';
import { UpdateNutritionMeasurementDto } from './dto/update-measurement.dto';

@Injectable()
export class NutritionMeasurementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, patientId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;
    const [data, total] = await Promise.all([
      this.prisma.nutritionMeasurement.findMany({ where, skip, take: limit, orderBy: { date: 'desc' }, include: { patient: true } }),
      this.prisma.nutritionMeasurement.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const measurement = await this.prisma.nutritionMeasurement.findFirst({ where: { id, tenantId }, include: { patient: true } });
    if (!measurement) throw new NotFoundException('Measurement not found');
    return measurement;
  }

  async create(tenantId: string, dto: CreateNutritionMeasurementDto) {
    const patient = await this.prisma.nutritionPatient.findFirst({ where: { id: dto.patientId, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.prisma.nutritionMeasurement.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        date: new Date(dto.date),
        weight: dto.weight,
        bodyFat: dto.bodyFat,
        muscleMass: dto.muscleMass,
        bmi: dto.bmi,
        waist: dto.waist,
        hip: dto.hip,
        arm: dto.arm,
        chest: dto.chest,
        thigh: dto.thigh,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateNutritionMeasurementDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.nutritionMeasurement.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.nutritionMeasurement.delete({ where: { id } });
  }

  async getPatientEvolution(tenantId: string, patientId: string) {
    const patient = await this.prisma.nutritionPatient.findFirst({ where: { id: patientId, tenantId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const measurements = await this.prisma.nutritionMeasurement.findMany({
      where: { tenantId, patientId },
      orderBy: { date: 'asc' },
      select: { date: true, weight: true, bodyFat: true, muscleMass: true, bmi: true, waist: true, hip: true },
    });

    const weightHistory = measurements
      .filter((m) => m.weight !== null)
      .map((m) => ({ date: m.date, value: m.weight }));

    const bodyFatHistory = measurements
      .filter((m) => m.bodyFat !== null)
      .map((m) => ({ date: m.date, value: m.bodyFat }));

    const muscleMassHistory = measurements
      .filter((m) => m.muscleMass !== null)
      .map((m) => ({ date: m.date, value: m.muscleMass }));

    const bmiHistory = measurements
      .filter((m) => m.bmi !== null)
      .map((m) => ({ date: m.date, value: m.bmi }));

    const latest = measurements.length > 0 ? measurements[measurements.length - 1] : null;
    const first = measurements.length > 0 ? measurements[0] : null;

    return {
      patient: { id: patient.id, name: patient.name, targetWeight: patient.targetWeight },
      totalMeasurements: measurements.length,
      weightHistory,
      bodyFatHistory,
      muscleMassHistory,
      bmiHistory,
      summary: first && latest ? {
        weightChange: latest.weight && first.weight ? Number((latest.weight - first.weight).toFixed(2)) : null,
        bodyFatChange: latest.bodyFat && first.bodyFat ? Number((latest.bodyFat - first.bodyFat).toFixed(2)) : null,
        muscleMassChange: latest.muscleMass && first.muscleMass ? Number((latest.muscleMass - first.muscleMass).toFixed(2)) : null,
        periodStart: first.date,
        periodEnd: latest.date,
      } : null,
    };
  }
}

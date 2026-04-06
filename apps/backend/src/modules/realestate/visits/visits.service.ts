import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    propertyId?: string,
    clientId?: string,
    status?: string,
    date?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (propertyId) where.propertyId = propertyId;
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.visitDate = { gte: start, lt: end };
    }
    const [data, total] = await Promise.all([
      this.prisma.realEstateVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { visitDate: 'desc' },
        include: { property: true, client: true },
      }),
      this.prisma.realEstateVisit.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const visit = await this.prisma.realEstateVisit.findFirst({
      where: { id, tenantId },
      include: { property: true, client: true },
    });
    if (!visit) throw new NotFoundException('Visita não encontrada');
    return visit;
  }

  async create(tenantId: string, dto: CreateVisitDto) {
    const property = await this.prisma.realEstateProperty.findFirst({
      where: { id: dto.propertyId, tenantId },
    });
    if (!property) throw new BadRequestException('Imóvel não encontrado');

    const client = await this.prisma.realEstateClient.findFirst({
      where: { id: dto.clientId, tenantId },
    });
    if (!client) throw new BadRequestException('Cliente não encontrado');

    return this.prisma.realEstateVisit.create({
      data: {
        tenantId,
        propertyId: dto.propertyId,
        clientId: dto.clientId,
        visitDate: new Date(dto.visitDate),
        status: dto.status || 'scheduled',
        feedback: dto.feedback,
        rating: dto.rating,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateVisitDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.visitDate) data.visitDate = new Date(dto.visitDate);
    return this.prisma.realEstateVisit.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.realEstateVisit.delete({ where: { id } });
  }
}

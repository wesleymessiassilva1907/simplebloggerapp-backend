import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, status?: string, type?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (status) where.status = status;
    if (type) where.type = type;
    const [data, total] = await Promise.all([
      this.prisma.realEstateDeal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { property: true, client: true },
      }),
      this.prisma.realEstateDeal.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const deal = await this.prisma.realEstateDeal.findFirst({
      where: { id, tenantId },
      include: { property: true, client: true },
    });
    if (!deal) throw new NotFoundException('Negócio não encontrado');
    return deal;
  }

  async create(tenantId: string, dto: CreateDealDto) {
    const property = await this.prisma.realEstateProperty.findFirst({
      where: { id: dto.propertyId, tenantId },
    });
    if (!property) throw new BadRequestException('Imóvel não encontrado');

    const client = await this.prisma.realEstateClient.findFirst({
      where: { id: dto.clientId, tenantId },
    });
    if (!client) throw new BadRequestException('Cliente não encontrado');

    const commission = (dto.commissionPercent / 100) * dto.value;

    return this.prisma.realEstateDeal.create({
      data: {
        tenantId,
        propertyId: dto.propertyId,
        clientId: dto.clientId,
        type: dto.type,
        value: dto.value,
        commissionPercent: dto.commissionPercent,
        commission,
        status: dto.status || 'pending',
        contractDate: dto.contractDate ? new Date(dto.contractDate) : undefined,
        closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDealDto) {
    const existing = await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.contractDate) data.contractDate = new Date(dto.contractDate);
    if (dto.closingDate) data.closingDate = new Date(dto.closingDate);

    // Recalculate commission if value or commissionPercent changed
    const value = dto.value ?? Number(existing.value);
    const commissionPercent = dto.commissionPercent ?? Number(existing.commissionPercent);
    if (dto.value !== undefined || dto.commissionPercent !== undefined) {
      data.commission = (commissionPercent / 100) * value;
    }

    return this.prisma.realEstateDeal.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.realEstateDeal.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, name?: string, type?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (type) where.type = type;
    const [data, total] = await Promise.all([
      this.prisma.realEstateClient.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.realEstateClient.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const client = await this.prisma.realEstateClient.findFirst({
      where: { id, tenantId },
      include: { visits: true, deals: true },
    });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async create(tenantId: string, dto: CreateClientDto) {
    return this.prisma.realEstateClient.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cpf: dto.cpf,
        type: dto.type,
        budget: dto.budget,
        preferences: dto.preferences,
        source: dto.source,
        status: dto.status || 'active',
        notes: dto.notes,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateClientDto) {
    await this.findOne(id, tenantId);
    return this.prisma.realEstateClient.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.realEstateClient.delete({ where: { id } });
  }
}

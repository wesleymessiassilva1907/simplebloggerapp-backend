import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateLegalClientDto } from './dto/create-client.dto';
import { UpdateLegalClientDto } from './dto/update-client.dto';

@Injectable()
export class LegalClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpfCnpj: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.legalClient.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.legalClient.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const client = await this.prisma.legalClient.findFirst({ where: { id, tenantId } });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async create(tenantId: string, dto: CreateLegalClientDto) {
    return this.prisma.legalClient.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        cpfCnpj: dto.cpfCnpj,
        type: dto.type,
        address: dto.address,
        notes: dto.notes,
        status: dto.status || 'active',
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateLegalClientDto) {
    await this.findOne(id, tenantId);
    return this.prisma.legalClient.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.legalClient.delete({ where: { id } });
  }
}

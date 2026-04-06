import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAestheticClientDto } from './dto/create-client.dto';
import { UpdateAestheticClientDto } from './dto/update-client.dto';

@Injectable()
export class AestheticClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { cpf: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.aestheticClient.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.aestheticClient.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const client = await this.prisma.aestheticClient.findFirst({ where: { id, tenantId } });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async create(tenantId: string, dto: CreateAestheticClientDto) {
    const data: any = { tenantId, ...dto };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    return this.prisma.aestheticClient.create({ data });
  }

  async update(id: string, tenantId: string, dto: UpdateAestheticClientDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    return this.prisma.aestheticClient.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.aestheticClient.delete({ where: { id } });
  }
}

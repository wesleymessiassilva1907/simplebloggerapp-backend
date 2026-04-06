import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateBarbershopClientDto } from './dto/create-client.dto';
import { UpdateBarbershopClientDto } from './dto/update-client.dto';

@Injectable()
export class BarbershopClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.barbershopClient.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.barbershopClient.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const client = await this.prisma.barbershopClient.findFirst({ where: { id, tenantId } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(tenantId: string, dto: CreateBarbershopClientDto) {
    const data: any = { tenantId, name: dto.name, phone: dto.phone, email: dto.email, notes: dto.notes };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    return this.prisma.barbershopClient.create({ data });
  }

  async update(id: string, tenantId: string, dto: UpdateBarbershopClientDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);
    return this.prisma.barbershopClient.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.barbershopClient.delete({ where: { id } });
  }
}

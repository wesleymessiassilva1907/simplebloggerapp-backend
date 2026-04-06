import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateBarberDto } from './dto/create-barber.dto';
import { UpdateBarberDto } from './dto/update-barber.dto';

@Injectable()
export class BarbersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.barbershopBarber.findMany({ where: { tenantId }, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.barbershopBarber.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const barber = await this.prisma.barbershopBarber.findFirst({ where: { id, tenantId } });
    if (!barber) throw new NotFoundException('Barber not found');
    return barber;
  }

  async create(tenantId: string, dto: CreateBarberDto) {
    return this.prisma.barbershopBarber.create({ data: { tenantId, ...dto } });
  }

  async update(id: string, tenantId: string, dto: UpdateBarberDto) {
    await this.findOne(id, tenantId);
    return this.prisma.barbershopBarber.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.barbershopBarber.delete({ where: { id } });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateBarbershopServiceDto } from './dto/create-service.dto';
import { UpdateBarbershopServiceDto } from './dto/update-service.dto';

@Injectable()
export class BarbershopServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.barbershopService.findMany({ where: { tenantId }, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.barbershopService.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const service = await this.prisma.barbershopService.findFirst({ where: { id, tenantId } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async create(tenantId: string, dto: CreateBarbershopServiceDto) {
    return this.prisma.barbershopService.create({ data: { tenantId, ...dto } });
  }

  async update(id: string, tenantId: string, dto: UpdateBarbershopServiceDto) {
    await this.findOne(id, tenantId);
    return this.prisma.barbershopService.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.barbershopService.delete({ where: { id } });
  }
}

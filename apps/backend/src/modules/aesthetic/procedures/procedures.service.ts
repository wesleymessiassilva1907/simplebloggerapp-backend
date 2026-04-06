import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAestheticProcedureDto } from './dto/create-procedure.dto';
import { UpdateAestheticProcedureDto } from './dto/update-procedure.dto';

@Injectable()
export class AestheticProceduresService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, category?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    const [data, total] = await Promise.all([
      this.prisma.aestheticProcedure.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.aestheticProcedure.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const procedure = await this.prisma.aestheticProcedure.findFirst({ where: { id, tenantId } });
    if (!procedure) throw new NotFoundException('Procedimento não encontrado');
    return procedure;
  }

  async create(tenantId: string, dto: CreateAestheticProcedureDto) {
    return this.prisma.aestheticProcedure.create({ data: { tenantId, ...dto } });
  }

  async update(id: string, tenantId: string, dto: UpdateAestheticProcedureDto) {
    await this.findOne(id, tenantId);
    return this.prisma.aestheticProcedure.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.aestheticProcedure.delete({ where: { id } });
  }
}

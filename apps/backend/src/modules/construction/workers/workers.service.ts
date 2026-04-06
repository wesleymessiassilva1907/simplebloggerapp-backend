import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.constructionWorker.findMany({ where: { tenantId }, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.constructionWorker.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const worker = await this.prisma.constructionWorker.findFirst({
      where: { id, tenantId },
      include: { projectWorkers: { include: { project: { select: { name: true } } } } },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }

  async create(tenantId: string, dto: CreateWorkerDto) {
    return this.prisma.constructionWorker.create({ data: { tenantId, ...dto } });
  }

  async update(id: string, tenantId: string, dto: UpdateWorkerDto) {
    await this.findOne(id, tenantId);
    return this.prisma.constructionWorker.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.constructionWorker.delete({ where: { id } });
  }

  async allocateToProject(tenantId: string, workerId: string, projectId: string, from?: string, to?: string) {
    return this.prisma.constructionProjectWorker.create({
      data: {
        tenantId, workerId, projectId,
        allocatedFrom: from ? new Date(from) : undefined,
        allocatedTo: to ? new Date(to) : undefined,
      },
    });
  }
}

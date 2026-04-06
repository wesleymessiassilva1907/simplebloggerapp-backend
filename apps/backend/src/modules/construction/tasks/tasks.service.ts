import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, projectId?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.constructionTask.findMany({
        where, skip, take: limit,
        include: { project: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.constructionTask.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const task = await this.prisma.constructionTask.findFirst({
      where: { id, tenantId },
      include: { project: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(tenantId: string, dto: CreateTaskDto) {
    const project = await this.prisma.constructionProject.findFirst({ where: { id: dto.projectId, tenantId } });
    if (!project) throw new BadRequestException('Invalid project');
    return this.prisma.constructionTask.create({
      data: {
        tenantId, projectId: dto.projectId, name: dto.name, description: dto.description,
        assignedTo: dto.assignedTo,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status || 'pending', progressPercent: dto.progressPercent || 0,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateTaskDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.constructionTask.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.constructionTask.delete({ where: { id } });
  }
}

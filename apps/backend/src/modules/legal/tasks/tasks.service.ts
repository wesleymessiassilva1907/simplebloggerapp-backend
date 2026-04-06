import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateLegalTaskDto } from './dto/create-task.dto';
import { UpdateLegalTaskDto } from './dto/update-task.dto';

@Injectable()
export class LegalTasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    caseId?: string,
    status?: string,
    priority?: string,
    dueDate?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (caseId) where.caseId = caseId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (dueDate) where.dueDate = { lte: new Date(dueDate) };

    const [data, total] = await Promise.all([
      this.prisma.legalTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: { case: { select: { id: true, caseNumber: true, title: true } } },
      }),
      this.prisma.legalTask.count({ where }),
    ]);

    const now = new Date();
    const processedData = data.map((task) => {
      if (
        task.dueDate &&
        task.dueDate < now &&
        !['concluida', 'cancelada', 'atrasada'].includes(task.status)
      ) {
        return { ...task, status: 'atrasada' };
      }
      return task;
    });

    return { data: processedData, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const task = await this.prisma.legalTask.findFirst({
      where: { id, tenantId },
      include: { case: { select: { id: true, caseNumber: true, title: true } } },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');

    const now = new Date();
    if (
      task.dueDate &&
      task.dueDate < now &&
      !['concluida', 'cancelada', 'atrasada'].includes(task.status)
    ) {
      await this.prisma.legalTask.update({ where: { id }, data: { status: 'atrasada' } });
      return { ...task, status: 'atrasada' };
    }
    return task;
  }

  async create(tenantId: string, dto: CreateLegalTaskDto) {
    await this.validateCase(dto.caseId, tenantId);
    return this.prisma.legalTask.create({
      data: {
        tenantId,
        caseId: dto.caseId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        dueDate: new Date(dto.dueDate),
        status: dto.status || 'pendente',
        priority: dto.priority || 'media',
        assignedTo: dto.assignedTo,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateLegalTaskDto) {
    await this.findOne(id, tenantId);
    if (dto.caseId) await this.validateCase(dto.caseId, tenantId);
    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    return this.prisma.legalTask.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.legalTask.delete({ where: { id } });
  }

  private async validateCase(caseId: string, tenantId: string) {
    const legalCase = await this.prisma.legalCase.findFirst({ where: { id: caseId, tenantId } });
    if (!legalCase) throw new NotFoundException('Processo não encontrado');
  }
}

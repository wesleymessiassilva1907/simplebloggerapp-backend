import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.constructionProject.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.constructionProject.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const project = await this.prisma.constructionProject.findFirst({
      where: { id, tenantId },
      include: { tasks: true, expenses: true, projectWorkers: { include: { worker: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(tenantId: string, dto: CreateProjectDto) {
    return this.prisma.constructionProject.create({
      data: {
        tenantId, name: dto.name, description: dto.description,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        budget: dto.budget, status: dto.status || 'planning', location: dto.location,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateProjectDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.constructionProject.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.constructionProject.delete({ where: { id } });
  }

  async getDashboard(tenantId: string) {
    const projects = await this.prisma.constructionProject.findMany({
      where: { tenantId },
      include: { tasks: true, expenses: true },
    });
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
    const totalExpenses = projects.reduce((sum, p) =>
      sum + p.expenses.reduce((eSum, e) => eSum + Number(e.amount), 0), 0);
    const allTasks = projects.flatMap(p => p.tasks);
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const avgProgress = allTasks.length > 0
      ? Math.round(allTasks.reduce((sum, t) => sum + t.progressPercent, 0) / allTasks.length)
      : 0;
    return {
      totalProjects: projects.length,
      activeProjects,
      totalBudget,
      totalExpenses,
      budgetUtilization: totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0,
      totalTasks: allTasks.length,
      completedTasks,
      avgProgress,
    };
  }
}

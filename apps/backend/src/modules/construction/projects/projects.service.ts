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
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

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

    // Expenses by day (last 30 days)
    const allExpenses = projects.flatMap(p => p.expenses);
    const expensesByDayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      expensesByDayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const e of allExpenses) {
      const key = e.expenseDate.toISOString().slice(0, 10);
      if (expensesByDayMap[key] !== undefined) {
        expensesByDayMap[key] += Number(e.amount);
      }
    }
    const expensesByDay = Object.entries(expensesByDayMap).map(([date, value]) => ({ date, value }));

    // Comparison vs last month (expenses)
    const thisMonthExpenses = allExpenses
      .filter(e => e.expenseDate >= thisMonthStart && e.expenseDate < thisMonthEnd)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const lastMonthExpenses = allExpenses
      .filter(e => e.expenseDate >= lastMonthStart && e.expenseDate < lastMonthEnd)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const comparisonVsLastMonth = {
      current: thisMonthExpenses,
      previous: lastMonthExpenses,
      percentChange: lastMonthExpenses > 0 ? Math.round(((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100) : 0,
    };

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    const overBudgetProjects = projects.filter(p => {
      const budget = Number(p.budget || 0);
      const spent = p.expenses.reduce((s, e) => s + Number(e.amount), 0);
      return budget > 0 && spent > budget;
    });
    if (overBudgetProjects.length > 0) {
      alerts.push({ type: 'critical', message: `${overBudgetProjects.length} project(s) are over budget` });
    }
    const overdueTasks = allTasks.filter(t => t.endDate && t.endDate < now && t.status !== 'completed');
    if (overdueTasks.length > 0) {
      alerts.push({ type: 'warning', message: `${overdueTasks.length} task(s) are overdue` });
    }
    const projectsAtRisk = projects.filter(p => {
      const budget = Number(p.budget || 0);
      const spent = p.expenses.reduce((s, e) => s + Number(e.amount), 0);
      return budget > 0 && spent / budget >= 0.9 && spent <= budget;
    });
    if (projectsAtRisk.length > 0) {
      alerts.push({ type: 'warning', message: `${projectsAtRisk.length} project(s) have used over 90% of budget` });
    }

    // Top projects by progress
    const topProjects = [...projects]
      .sort((a, b) => {
        const aProgress = a.tasks.length > 0 ? a.tasks.reduce((s, t) => s + t.progressPercent, 0) / a.tasks.length : 0;
        const bProgress = b.tasks.length > 0 ? b.tasks.reduce((s, t) => s + t.progressPercent, 0) / b.tasks.length : 0;
        return bProgress - aProgress;
      })
      .slice(0, 5)
      .map(p => {
        const progress = p.tasks.length > 0 ? Math.round(p.tasks.reduce((s, t) => s + t.progressPercent, 0) / p.tasks.length) : 0;
        return { name: p.name, value: progress, subtitle: `${p.tasks.length} tasks` };
      });

    // Status breakdown
    const statusMap: Record<string, number> = {};
    for (const p of projects) {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    }
    const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    return {
      totalProjects: projects.length,
      activeProjects,
      totalBudget,
      totalExpenses,
      budgetUtilization: totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0,
      totalTasks: allTasks.length,
      completedTasks,
      avgProgress,
      expensesByDay,
      comparisonVsLastMonth,
      alerts,
      topProjects,
      statusBreakdown,
      overdueTasksCount: overdueTasks.length,
      projectsAtRisk: projectsAtRisk.length,
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, projectId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (projectId) where.projectId = projectId;
    const [data, total] = await Promise.all([
      this.prisma.constructionExpense.findMany({
        where, skip, take: limit,
        include: { project: { select: { name: true } } },
        orderBy: { expenseDate: 'desc' },
      }),
      this.prisma.constructionExpense.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const expense = await this.prisma.constructionExpense.findFirst({ where: { id, tenantId }, include: { project: true } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(tenantId: string, dto: CreateExpenseDto) {
    const project = await this.prisma.constructionProject.findFirst({ where: { id: dto.projectId, tenantId } });
    if (!project) throw new BadRequestException('Invalid project');
    return this.prisma.constructionExpense.create({
      data: {
        tenantId, projectId: dto.projectId, description: dto.description,
        category: dto.category, amount: dto.amount,
        expenseDate: new Date(dto.expenseDate), supplier: dto.supplier,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateExpenseDto) {
    await this.findOne(id, tenantId);
    const data: any = { ...dto };
    if (dto.expenseDate) data.expenseDate = new Date(dto.expenseDate);
    return this.prisma.constructionExpense.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.constructionExpense.delete({ where: { id } });
  }
}

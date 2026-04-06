import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Construction - Expenses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('construction/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'List expenses' })
  @ApiQuery({ name: 'projectId', required: false })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto, @Query('projectId') projectId?: string) {
    return this.expensesService.findAll(tenantId, pagination.page, pagination.limit, projectId);
  }

  @Get(':id')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Get expense by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) { return this.expensesService.findOne(id, tenantId); }

  @Post()
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Create expense' })
  create(@TenantId() tenantId: string, @Body() dto: CreateExpenseDto) { return this.expensesService.create(tenantId, dto); }

  @Put(':id')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Update expense' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateExpenseDto) { return this.expensesService.update(id, tenantId, dto); }

  @Delete(':id')
  @Roles('tenant_admin', 'construction_manager')
  @ApiOperation({ summary: 'Delete expense' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) { return this.expensesService.remove(id, tenantId); }
}

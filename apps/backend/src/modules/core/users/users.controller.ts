import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'List users in tenant' })
  findAll(@TenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.usersService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }

  @Post()
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'Create user' })
  create(@TenantId() tenantId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'Deactivate user' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.usersService.remove(id, tenantId);
  }
}

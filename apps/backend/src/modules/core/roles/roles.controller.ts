import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'List all roles' })
  findAll() { return this.rolesService.findAll(); }

  @Post(':userId/assign/:roleId')
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'Assign role to user' })
  assign(@Param('userId') userId: string, @Param('roleId') roleId: string) { return this.rolesService.assignRole(userId, roleId); }

  @Delete(':userId/remove/:roleId')
  @Roles('super_admin', 'tenant_admin')
  @ApiOperation({ summary: 'Remove role from user' })
  remove(@Param('userId') userId: string, @Param('roleId') roleId: string) { return this.rolesService.removeRole(userId, roleId); }
}

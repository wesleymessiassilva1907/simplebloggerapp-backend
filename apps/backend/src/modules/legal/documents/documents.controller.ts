import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { LegalDocumentsService } from './documents.service';
import { CreateLegalDocumentDto } from './dto/create-document.dto';
import { UpdateLegalDocumentDto } from './dto/update-document.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Legal - Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard, RolesGuard)
@Controller('legal/documents')
export class LegalDocumentsController {
  constructor(private readonly documentsService: LegalDocumentsService) {}

  @Get()
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Listar documentos' })
  @ApiQuery({ name: 'caseId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('caseId') caseId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.documentsService.findAll(tenantId, pagination.page, pagination.limit, caseId, type, status);
  }

  @Get(':id')
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Buscar documento por ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.documentsService.findOne(id, tenantId);
  }

  @Post()
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Cadastrar novo documento' })
  create(@TenantId() tenantId: string, @Body() dto: CreateLegalDocumentDto) {
    return this.documentsService.create(tenantId, dto);
  }

  @Put(':id')
  @Roles('tenant_admin', 'legal_lawyer', 'legal_paralegal')
  @ApiOperation({ summary: 'Atualizar documento' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: UpdateLegalDocumentDto) {
    return this.documentsService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin', 'legal_lawyer')
  @ApiOperation({ summary: 'Remover documento' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.documentsService.remove(id, tenantId);
  }
}

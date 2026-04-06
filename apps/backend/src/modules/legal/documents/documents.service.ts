import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateLegalDocumentDto } from './dto/create-document.dto';
import { UpdateLegalDocumentDto } from './dto/update-document.dto';

@Injectable()
export class LegalDocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10, caseId?: string, type?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (caseId) where.caseId = caseId;
    if (type) where.type = type;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.legalDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { case: { select: { id: true, caseNumber: true, title: true } } },
      }),
      this.prisma.legalDocument.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const document = await this.prisma.legalDocument.findFirst({
      where: { id, tenantId },
      include: { case: { select: { id: true, caseNumber: true, title: true } } },
    });
    if (!document) throw new NotFoundException('Documento não encontrado');
    return document;
  }

  async create(tenantId: string, dto: CreateLegalDocumentDto) {
    await this.validateCase(dto.caseId, tenantId);
    return this.prisma.legalDocument.create({
      data: {
        tenantId,
        caseId: dto.caseId,
        title: dto.title,
        type: dto.type,
        content: dto.content,
        filePath: dto.filePath,
        fileSize: dto.fileSize,
        version: dto.version || 1,
        status: dto.status || 'rascunho',
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateLegalDocumentDto) {
    await this.findOne(id, tenantId);
    if (dto.caseId) await this.validateCase(dto.caseId, tenantId);
    return this.prisma.legalDocument.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.legalDocument.delete({ where: { id } });
  }

  private async validateCase(caseId: string, tenantId: string) {
    const legalCase = await this.prisma.legalCase.findFirst({ where: { id: caseId, tenantId } });
    if (!legalCase) throw new NotFoundException('Processo não encontrado');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAestheticPackageDto } from './dto/create-package.dto';
import { UpdateAestheticPackageDto } from './dto/update-package.dto';

@Injectable()
export class AestheticPackagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    const [data, total] = await Promise.all([
      this.prisma.aestheticPackage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { procedures: { include: { procedure: true } } },
      }),
      this.prisma.aestheticPackage.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const pkg = await this.prisma.aestheticPackage.findFirst({
      where: { id, tenantId },
      include: { procedures: { include: { procedure: true } } },
    });
    if (!pkg) throw new NotFoundException('Pacote não encontrado');
    return pkg;
  }

  async create(tenantId: string, dto: CreateAestheticPackageDto) {
    const { procedures, ...rest } = dto;
    return this.prisma.aestheticPackage.create({
      data: {
        tenantId,
        ...rest,
        procedures: procedures?.length
          ? {
              create: procedures.map((p) => ({
                procedureId: p.procedureId,
                sessions: p.sessions,
              })),
            }
          : undefined,
      },
      include: { procedures: { include: { procedure: true } } },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateAestheticPackageDto) {
    await this.findOne(id, tenantId);
    const { procedures, ...rest } = dto;

    if (procedures !== undefined) {
      await this.prisma.aestheticPackageProcedure.deleteMany({ where: { packageId: id } });
    }

    return this.prisma.aestheticPackage.update({
      where: { id },
      data: {
        ...rest,
        procedures: procedures !== undefined
          ? {
              create: procedures.map((p) => ({
                procedureId: p.procedureId,
                sessions: p.sessions,
              })),
            }
          : undefined,
      },
      include: { procedures: { include: { procedure: true } } },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.aestheticPackageProcedure.deleteMany({ where: { packageId: id } });
    return this.prisma.aestheticPackage.delete({ where: { id } });
  }
}

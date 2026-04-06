import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { TenantId } from '@/common/decorators/tenant.decorator';
import { PrismaService } from '@/common/prisma/prisma.service';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('search')
export class SearchController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across modules' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'module', required: false })
  async search(@TenantId() tenantId: string, @Query('q') q: string, @Query('module') module?: string) {
    if (!q || q.length < 2) return { results: [] };

    const searchTerm = q.trim();
    const results: any[] = [];

    const shouldSearch = (mod: string) => !module || module === mod;

    const promises: Promise<void>[] = [];

    if (shouldSearch('clinic')) {
      promises.push(
        this.prisma.clinicPatient.findMany({
          where: { tenantId, OR: [{ name: { contains: searchTerm, mode: 'insensitive' } }, { email: { contains: searchTerm, mode: 'insensitive' } }, { cpf: { contains: searchTerm } }] },
          take: 5, select: { id: true, name: true, email: true },
        }).then(items => items.forEach(i => results.push({ module: 'clinic', type: 'patient', id: i.id, title: i.name, subtitle: i.email, href: '/clinic/patients' }))),
        this.prisma.clinicDoctor.findMany({
          where: { tenantId, OR: [{ name: { contains: searchTerm, mode: 'insensitive' } }, { specialty: { contains: searchTerm, mode: 'insensitive' } }] },
          take: 5, select: { id: true, name: true, specialty: true },
        }).then(items => items.forEach(i => results.push({ module: 'clinic', type: 'doctor', id: i.id, title: i.name, subtitle: i.specialty, href: '/clinic/doctors' }))),
      );
    }

    if (shouldSearch('construction')) {
      promises.push(
        this.prisma.constructionProject.findMany({
          where: { tenantId, OR: [{ name: { contains: searchTerm, mode: 'insensitive' } }, { location: { contains: searchTerm, mode: 'insensitive' } }] },
          take: 5, select: { id: true, name: true, location: true },
        }).then(items => items.forEach(i => results.push({ module: 'construction', type: 'project', id: i.id, title: i.name, subtitle: i.location, href: '/construction/projects' }))),
      );
    }

    if (shouldSearch('barbershop')) {
      promises.push(
        this.prisma.barbershopClient.findMany({
          where: { tenantId, OR: [{ name: { contains: searchTerm, mode: 'insensitive' } }, { phone: { contains: searchTerm } }] },
          take: 5, select: { id: true, name: true, phone: true },
        }).then(items => items.forEach(i => results.push({ module: 'barbershop', type: 'client', id: i.id, title: i.name, subtitle: i.phone, href: '/barbershop/clients' }))),
      );
    }

    if (shouldSearch('realestate')) {
      promises.push(
        this.prisma.realEstateProperty.findMany({
          where: { tenantId, OR: [{ title: { contains: searchTerm, mode: 'insensitive' } }, { neighborhood: { contains: searchTerm, mode: 'insensitive' } }, { city: { contains: searchTerm, mode: 'insensitive' } }] },
          take: 5, select: { id: true, title: true, neighborhood: true, city: true },
        }).then(items => items.forEach(i => results.push({ module: 'realestate', type: 'property', id: i.id, title: i.title, subtitle: `${i.neighborhood || ''} ${i.city || ''}`.trim(), href: '/realestate/properties' }))),
      );
    }

    if (shouldSearch('legal')) {
      promises.push(
        this.prisma.legalCase.findMany({
          where: { tenantId, OR: [{ title: { contains: searchTerm, mode: 'insensitive' } }, { caseNumber: { contains: searchTerm } }] },
          take: 5, select: { id: true, title: true, caseNumber: true },
        }).then(items => items.forEach(i => results.push({ module: 'legal', type: 'case', id: i.id, title: i.title, subtitle: i.caseNumber, href: '/legal/cases' }))),
      );
    }

    if (shouldSearch('restaurant')) {
      promises.push(
        this.prisma.restaurantMenuItem.findMany({
          where: { tenantId, name: { contains: searchTerm, mode: 'insensitive' } },
          take: 5, select: { id: true, name: true },
        }).then(items => items.forEach(i => results.push({ module: 'restaurant', type: 'menuItem', id: i.id, title: i.name, href: '/restaurant/menu-items' }))),
      );
    }

    if (shouldSearch('dental')) {
      promises.push(
        this.prisma.dentalPatient.findMany({
          where: { tenantId, OR: [{ name: { contains: searchTerm, mode: 'insensitive' } }, { cpf: { contains: searchTerm } }] },
          take: 5, select: { id: true, name: true, phone: true },
        }).then(items => items.forEach(i => results.push({ module: 'dental', type: 'patient', id: i.id, title: i.name, subtitle: i.phone, href: '/dental/patients' }))),
      );
    }

    if (shouldSearch('aesthetic')) {
      promises.push(
        this.prisma.aestheticClient.findMany({
          where: { tenantId, OR: [{ name: { contains: searchTerm, mode: 'insensitive' } }, { phone: { contains: searchTerm } }] },
          take: 5, select: { id: true, name: true, phone: true },
        }).then(items => items.forEach(i => results.push({ module: 'aesthetic', type: 'client', id: i.id, title: i.name, subtitle: i.phone, href: '/aesthetic/clients' }))),
      );
    }

    if (shouldSearch('nutrition')) {
      promises.push(
        this.prisma.nutritionPatient.findMany({
          where: { tenantId, OR: [{ name: { contains: searchTerm, mode: 'insensitive' } }, { email: { contains: searchTerm, mode: 'insensitive' } }] },
          take: 5, select: { id: true, name: true, email: true },
        }).then(items => items.forEach(i => results.push({ module: 'nutrition', type: 'patient', id: i.id, title: i.name, subtitle: i.email, href: '/nutrition/patients' }))),
      );
    }

    await Promise.allSettled(promises);

    return { results: results.slice(0, 20), total: results.length };
  }
}

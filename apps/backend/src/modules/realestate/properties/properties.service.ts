import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
    type?: string,
    status?: string,
    neighborhood?: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (type) where.type = type;
    if (status) where.status = status;
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }
    const [data, total] = await Promise.all([
      this.prisma.realEstateProperty.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.realEstateProperty.count({ where }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const property = await this.prisma.realEstateProperty.findFirst({
      where: { id, tenantId },
      include: { visits: true, deals: true },
    });
    if (!property) throw new NotFoundException('Imóvel não encontrado');
    return property;
  }

  async create(tenantId: string, dto: CreatePropertyDto) {
    return this.prisma.realEstateProperty.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        status: dto.status || 'available',
        price: dto.price,
        area: dto.area,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        parkingSpots: dto.parkingSpots,
        address: dto.address,
        neighborhood: dto.neighborhood,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        features: dto.features || [],
        images: dto.images || [],
        condominium: dto.condominium,
        iptu: dto.iptu,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdatePropertyDto) {
    await this.findOne(id, tenantId);
    return this.prisma.realEstateProperty.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.realEstateProperty.delete({ where: { id } });
  }

  async getDashboard(tenantId: string) {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [properties, allDeals, allVisits, staleLeads] = await Promise.all([
      this.prisma.realEstateProperty.findMany({ where: { tenantId } }),
      this.prisma.realEstateDeal.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.realEstateVisit.findMany({ where: { tenantId } }),
      this.prisma.realEstateClient.count({
        where: { tenantId, status: 'active', updatedAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const available = properties.filter(p => p.status === 'available').length;
    const sold = properties.filter(p => p.status === 'sold').length;
    const rented = properties.filter(p => p.status === 'rented').length;
    const totalPortfolioValue = properties.reduce((sum, p) => sum + Number(p.price || 0), 0);

    // Deals by month (last 6 months)
    const dealsByMonth: { date: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = allDeals.filter(d => d.status === 'closed' && d.closingDate && d.closingDate >= mStart && d.closingDate < mEnd).length;
      dealsByMonth.push({ date: mStart.toISOString().slice(0, 7), value: count });
    }

    // Comparison vs last month (closed deals)
    const thisMonthClosed = allDeals.filter(d => d.status === 'closed' && d.closingDate && d.closingDate >= thisMonthStart && d.closingDate < thisMonthEnd).length;
    const lastMonthClosed = allDeals.filter(d => d.status === 'closed' && d.closingDate && d.closingDate >= lastMonthStart && d.closingDate < lastMonthEnd).length;
    const comparisonVsLastMonth = {
      current: thisMonthClosed,
      previous: lastMonthClosed,
      percentChange: lastMonthClosed > 0 ? Math.round(((thisMonthClosed - lastMonthClosed) / lastMonthClosed) * 100) : 0,
    };

    // Alerts
    const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];
    const longOnMarket = properties.filter(p => p.status === 'available' && p.createdAt < ninetyDaysAgo);
    if (longOnMarket.length > 0) {
      alerts.push({ type: 'warning', message: `${longOnMarket.length} propert(ies) on market for over 90 days` });
    }
    if (staleLeads > 0) {
      alerts.push({ type: 'warning', message: `${staleLeads} stale lead(s) with no activity in 30 days` });
    }
    const activeNegotiations = allDeals.filter(d => d.status === 'negotiation').length;
    if (activeNegotiations > 0) {
      alerts.push({ type: 'info', message: `${activeNegotiations} active negotiation(s) in progress` });
    }

    // Top properties by value
    const topProperties = [...properties]
      .sort((a, b) => Number(b.price) - Number(a.price))
      .slice(0, 5)
      .map(p => ({ name: p.title, value: Number(p.price), subtitle: p.status }));

    // Status breakdown
    const statusMap: Record<string, number> = {};
    for (const p of properties) {
      statusMap[p.status] = (statusMap[p.status] || 0) + 1;
    }
    const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Average days on market for available properties
    const availableProperties = properties.filter(p => p.status === 'available');
    const avgDaysOnMarket = availableProperties.length > 0
      ? Math.round(availableProperties.reduce((sum, p) => sum + (now.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24), 0) / availableProperties.length)
      : 0;

    // Total commission from closed deals
    const totalCommission = allDeals
      .filter(d => d.status === 'closed')
      .reduce((sum, d) => sum + Number(d.commission || 0), 0);

    // Conversion rate (visits to deals)
    const totalVisits = allVisits.length;
    const totalClosedDeals = allDeals.filter(d => d.status === 'closed').length;
    const conversionRate = totalVisits > 0 ? Math.round((totalClosedDeals / totalVisits) * 100) : 0;

    return {
      totalProperties: properties.length,
      available,
      sold,
      rented,
      totalPortfolioValue,
      dealsByMonth,
      comparisonVsLastMonth,
      alerts,
      topProperties,
      statusBreakdown,
      avgDaysOnMarket,
      totalCommission,
      conversionRate,
    };
  }
}

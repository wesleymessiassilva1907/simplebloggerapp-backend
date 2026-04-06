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
    const properties = await this.prisma.realEstateProperty.findMany({ where: { tenantId } });
    const available = properties.filter(p => p.status === 'available').length;
    const sold = properties.filter(p => p.status === 'sold').length;
    const rented = properties.filter(p => p.status === 'rented').length;
    const totalPortfolioValue = properties.reduce((sum, p) => sum + Number(p.price || 0), 0);
    return {
      totalProperties: properties.length,
      available,
      sold,
      rented,
      totalPortfolioValue,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRestaurantDriverDto } from './dto/create-driver.dto';
import { UpdateRestaurantDriverDto } from './dto/update-driver.dto';

@Injectable()
export class RestaurantDriversService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.restaurantDriver.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.restaurantDriver.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    const driver = await this.prisma.restaurantDriver.findFirst({ where: { id, tenantId } });
    if (!driver) throw new NotFoundException('Motorista não encontrado');
    return driver;
  }

  async create(tenantId: string, dto: CreateRestaurantDriverDto) {
    return this.prisma.restaurantDriver.create({ data: { tenantId, ...dto } });
  }

  async update(id: string, tenantId: string, dto: UpdateRestaurantDriverDto) {
    await this.findOne(id, tenantId);
    return this.prisma.restaurantDriver.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.restaurantDriver.delete({ where: { id } });
  }

  async toggleAvailability(id: string, tenantId: string) {
    const driver = await this.findOne(id, tenantId);
    return this.prisma.restaurantDriver.update({
      where: { id },
      data: { isAvailable: !driver.isAvailable },
    });
  }
}

import { Module } from '@nestjs/common';
import { RestaurantOrdersService } from './orders.service';
import { RestaurantOrdersController } from './orders.controller';

@Module({
  controllers: [RestaurantOrdersController],
  providers: [RestaurantOrdersService],
  exports: [RestaurantOrdersService],
})
export class RestaurantOrdersModule {}

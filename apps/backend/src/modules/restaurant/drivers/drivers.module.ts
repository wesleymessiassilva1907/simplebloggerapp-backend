import { Module } from '@nestjs/common';
import { RestaurantDriversService } from './drivers.service';
import { RestaurantDriversController } from './drivers.controller';

@Module({
  controllers: [RestaurantDriversController],
  providers: [RestaurantDriversService],
  exports: [RestaurantDriversService],
})
export class RestaurantDriversModule {}

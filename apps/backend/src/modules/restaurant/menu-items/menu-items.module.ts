import { Module } from '@nestjs/common';
import { RestaurantMenuItemsService } from './menu-items.service';
import { RestaurantMenuItemsController } from './menu-items.controller';

@Module({
  controllers: [RestaurantMenuItemsController],
  providers: [RestaurantMenuItemsService],
  exports: [RestaurantMenuItemsService],
})
export class RestaurantMenuItemsModule {}

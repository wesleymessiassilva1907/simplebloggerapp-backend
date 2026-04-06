import { Module } from '@nestjs/common';
import { RestaurantCategoriesService } from './categories.service';
import { RestaurantCategoriesController } from './categories.controller';

@Module({
  controllers: [RestaurantCategoriesController],
  providers: [RestaurantCategoriesService],
  exports: [RestaurantCategoriesService],
})
export class RestaurantCategoriesModule {}

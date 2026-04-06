import { Module } from '@nestjs/common';
import { RestaurantCategoriesModule } from './categories/categories.module';
import { RestaurantMenuItemsModule } from './menu-items/menu-items.module';
import { RestaurantOrdersModule } from './orders/orders.module';
import { RestaurantDriversModule } from './drivers/drivers.module';

@Module({
  imports: [
    RestaurantCategoriesModule,
    RestaurantMenuItemsModule,
    RestaurantOrdersModule,
    RestaurantDriversModule,
  ],
})
export class RestaurantModule {}

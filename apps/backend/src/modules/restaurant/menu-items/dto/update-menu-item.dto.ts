import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantMenuItemDto } from './create-menu-item.dto';

export class UpdateRestaurantMenuItemDto extends PartialType(CreateRestaurantMenuItemDto) {}

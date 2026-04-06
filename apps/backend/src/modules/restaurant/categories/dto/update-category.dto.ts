import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantCategoryDto } from './create-category.dto';

export class UpdateRestaurantCategoryDto extends PartialType(CreateRestaurantCategoryDto) {}

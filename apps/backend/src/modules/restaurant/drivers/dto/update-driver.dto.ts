import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDriverDto } from './create-driver.dto';

export class UpdateRestaurantDriverDto extends PartialType(CreateRestaurantDriverDto) {}

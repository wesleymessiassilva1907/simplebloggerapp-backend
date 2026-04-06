import { PartialType } from '@nestjs/swagger';
import { CreateBarbershopServiceDto } from './create-service.dto';

export class UpdateBarbershopServiceDto extends PartialType(CreateBarbershopServiceDto) {}

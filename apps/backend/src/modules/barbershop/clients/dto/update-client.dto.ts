import { PartialType } from '@nestjs/swagger';
import { CreateBarbershopClientDto } from './create-client.dto';

export class UpdateBarbershopClientDto extends PartialType(CreateBarbershopClientDto) {}

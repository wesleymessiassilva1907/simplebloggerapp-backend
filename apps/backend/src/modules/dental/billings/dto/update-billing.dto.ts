import { PartialType } from '@nestjs/swagger';
import { CreateDentalBillingDto } from './create-billing.dto';

export class UpdateDentalBillingDto extends PartialType(CreateDentalBillingDto) {}

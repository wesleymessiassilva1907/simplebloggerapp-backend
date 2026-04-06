import { PartialType } from '@nestjs/swagger';
import { CreateAestheticBillingDto } from './create-billing.dto';

export class UpdateAestheticBillingDto extends PartialType(CreateAestheticBillingDto) {}

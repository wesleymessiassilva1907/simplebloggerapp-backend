import { PartialType } from '@nestjs/swagger';
import { CreateClinicBillingDto } from './create-clinic-billing.dto';

export class UpdateClinicBillingDto extends PartialType(CreateClinicBillingDto) {}

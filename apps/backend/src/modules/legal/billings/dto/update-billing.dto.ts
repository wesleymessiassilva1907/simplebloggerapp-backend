import { PartialType } from '@nestjs/swagger';
import { CreateLegalBillingDto } from './create-billing.dto';

export class UpdateLegalBillingDto extends PartialType(CreateLegalBillingDto) {}

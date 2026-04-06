import { PartialType } from '@nestjs/swagger';
import { CreateLegalClientDto } from './create-client.dto';

export class UpdateLegalClientDto extends PartialType(CreateLegalClientDto) {}

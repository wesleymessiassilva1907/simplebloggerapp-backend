import { PartialType } from '@nestjs/swagger';
import { CreateLegalCaseDto } from './create-case.dto';

export class UpdateLegalCaseDto extends PartialType(CreateLegalCaseDto) {}

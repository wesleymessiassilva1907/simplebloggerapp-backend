import { PartialType } from '@nestjs/swagger';
import { CreateLegalTaskDto } from './create-task.dto';

export class UpdateLegalTaskDto extends PartialType(CreateLegalTaskDto) {}

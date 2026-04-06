import { PartialType } from '@nestjs/swagger';
import { CreateAestheticProcedureDto } from './create-procedure.dto';

export class UpdateAestheticProcedureDto extends PartialType(CreateAestheticProcedureDto) {}

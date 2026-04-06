import { PartialType } from '@nestjs/swagger';
import { CreateLegalDocumentDto } from './create-document.dto';

export class UpdateLegalDocumentDto extends PartialType(CreateLegalDocumentDto) {}

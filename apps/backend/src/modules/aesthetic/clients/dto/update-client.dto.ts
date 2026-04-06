import { PartialType } from '@nestjs/swagger';
import { CreateAestheticClientDto } from './create-client.dto';

export class UpdateAestheticClientDto extends PartialType(CreateAestheticClientDto) {}

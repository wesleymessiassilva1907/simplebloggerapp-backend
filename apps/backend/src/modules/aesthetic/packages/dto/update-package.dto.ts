import { PartialType } from '@nestjs/swagger';
import { CreateAestheticPackageDto } from './create-package.dto';

export class UpdateAestheticPackageDto extends PartialType(CreateAestheticPackageDto) {}

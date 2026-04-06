import { Module } from '@nestjs/common';
import { AestheticPackagesService } from './packages.service';
import { AestheticPackagesController } from './packages.controller';

@Module({
  controllers: [AestheticPackagesController],
  providers: [AestheticPackagesService],
  exports: [AestheticPackagesService],
})
export class AestheticPackagesModule {}

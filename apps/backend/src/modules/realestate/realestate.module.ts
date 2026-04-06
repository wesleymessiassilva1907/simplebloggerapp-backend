import { Module } from '@nestjs/common';
import { PropertiesModule } from './properties/properties.module';
import { ClientsModule } from './clients/clients.module';
import { VisitsModule } from './visits/visits.module';
import { DealsModule } from './deals/deals.module';

@Module({
  imports: [PropertiesModule, ClientsModule, VisitsModule, DealsModule],
})
export class RealEstateModule {}

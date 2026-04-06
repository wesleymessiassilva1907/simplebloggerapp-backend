import { Module } from '@nestjs/common';
import { AestheticClientsModule } from './clients/clients.module';
import { AestheticProceduresModule } from './procedures/procedures.module';
import { AestheticAppointmentsModule } from './appointments/appointments.module';
import { AestheticPackagesModule } from './packages/packages.module';
import { AestheticBillingsModule } from './billings/billings.module';

@Module({
  imports: [
    AestheticClientsModule,
    AestheticProceduresModule,
    AestheticAppointmentsModule,
    AestheticPackagesModule,
    AestheticBillingsModule,
  ],
})
export class AestheticModule {}

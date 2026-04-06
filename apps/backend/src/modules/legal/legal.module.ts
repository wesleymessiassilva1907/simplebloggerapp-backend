import { Module } from '@nestjs/common';
import { LegalClientsModule } from './clients/clients.module';
import { LegalCasesModule } from './cases/cases.module';
import { LegalDocumentsModule } from './documents/documents.module';
import { LegalTasksModule } from './tasks/tasks.module';
import { LegalBillingsModule } from './billings/billings.module';

@Module({
  imports: [
    LegalClientsModule,
    LegalCasesModule,
    LegalDocumentsModule,
    LegalTasksModule,
    LegalBillingsModule,
  ],
})
export class LegalModule {}

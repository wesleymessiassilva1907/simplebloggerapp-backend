import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/core/auth/auth.module';
import { TenantsModule } from './modules/core/tenants/tenants.module';
import { UsersModule } from './modules/core/users/users.module';
import { RolesModule } from './modules/core/roles/roles.module';
import { AuditModule } from './modules/core/audit/audit.module';
import { HealthModule } from './modules/core/health/health.module';
import { NotificationsModule } from './modules/core/notifications/notifications.module';
import { BillingModule } from './modules/core/billing/billing.module';
import { PatientsModule } from './modules/clinic/patients/patients.module';
import { DoctorsModule } from './modules/clinic/doctors/doctors.module';
import { AppointmentsModule } from './modules/clinic/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/clinic/medical-records/medical-records.module';
import { ClinicBillingModule } from './modules/clinic/billing/clinic-billing.module';
import { ProjectsModule } from './modules/construction/projects/projects.module';
import { TasksModule } from './modules/construction/tasks/tasks.module';
import { ExpensesModule } from './modules/construction/expenses/expenses.module';
import { WorkersModule } from './modules/construction/workers/workers.module';
import { AiModule } from './modules/ai/ai.module';
import { MetricsModule } from './modules/core/health/metrics.module';
import { BarbersModule } from './modules/barbershop/barbers/barbers.module';
import { BarbershopServicesModule } from './modules/barbershop/services/services.module';
import { BarbershopClientsModule } from './modules/barbershop/clients/clients.module';
import { BookingsModule } from './modules/barbershop/bookings/bookings.module';
import { ProductsModule } from './modules/barbershop/products/products.module';
import { OrdersModule } from './modules/barbershop/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    RolesModule,
    AuditModule,
    HealthModule,
    MetricsModule,
    NotificationsModule,
    BillingModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    ClinicBillingModule,
    ProjectsModule,
    TasksModule,
    ExpensesModule,
    WorkersModule,
    AiModule,
    BarbersModule,
    BarbershopServicesModule,
    BarbershopClientsModule,
    BookingsModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}

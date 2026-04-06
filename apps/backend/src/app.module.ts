import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { StorageModule } from './common/storage/storage.module';
import { LoggerModule } from './common/logger/logger.module';
import { CacheModule } from './common/cache/cache.module';
import { QueueModule } from './common/queue/queue.module';
import { EmailModule } from './common/email/email.module';
import { AuthModule } from './modules/core/auth/auth.module';
import { TenantsModule } from './modules/core/tenants/tenants.module';
import { UsersModule } from './modules/core/users/users.module';
import { RolesModule } from './modules/core/roles/roles.module';
import { AuditModule } from './modules/core/audit/audit.module';
import { HealthModule } from './modules/core/health/health.module';
import { NotificationsModule } from './modules/core/notifications/notifications.module';
import { BillingModule } from './modules/core/billing/billing.module';
import { MetricsModule } from './modules/core/health/metrics.module';
import { AiModule } from './modules/ai/ai.module';
// Clinic
import { PatientsModule } from './modules/clinic/patients/patients.module';
import { DoctorsModule } from './modules/clinic/doctors/doctors.module';
import { AppointmentsModule } from './modules/clinic/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/clinic/medical-records/medical-records.module';
import { ClinicBillingModule } from './modules/clinic/billing/clinic-billing.module';
// Construction
import { ProjectsModule } from './modules/construction/projects/projects.module';
import { TasksModule } from './modules/construction/tasks/tasks.module';
import { ExpensesModule } from './modules/construction/expenses/expenses.module';
import { WorkersModule } from './modules/construction/workers/workers.module';
// Barbershop
import { BarbersModule } from './modules/barbershop/barbers/barbers.module';
import { BarbershopServicesModule } from './modules/barbershop/services/services.module';
import { BarbershopClientsModule } from './modules/barbershop/clients/clients.module';
import { BookingsModule } from './modules/barbershop/bookings/bookings.module';
import { ProductsModule } from './modules/barbershop/products/products.module';
import { OrdersModule } from './modules/barbershop/orders/orders.module';
// Real Estate
import { RealEstatePropertiesModule } from './modules/realestate/properties/properties.module';
import { RealEstateClientsModule } from './modules/realestate/clients/clients.module';
import { RealEstateVisitsModule } from './modules/realestate/visits/visits.module';
import { RealEstateDealsModule } from './modules/realestate/deals/deals.module';
// Nutrition
import { NutritionPatientsModule } from './modules/nutrition/patients/patients.module';
import { NutritionPlansModule } from './modules/nutrition/plans/plans.module';
import { NutritionMealsModule } from './modules/nutrition/meals/meals.module';
import { NutritionAppointmentsModule } from './modules/nutrition/appointments/appointments.module';
import { NutritionMeasurementsModule } from './modules/nutrition/measurements/measurements.module';
// Legal
import { LegalClientsModule } from './modules/legal/clients/clients.module';
import { LegalCasesModule } from './modules/legal/cases/cases.module';
import { LegalDocumentsModule } from './modules/legal/documents/documents.module';
import { LegalTasksModule } from './modules/legal/tasks/tasks.module';
import { LegalBillingsModule } from './modules/legal/billings/billings.module';
// Restaurant
import { RestaurantCategoriesModule } from './modules/restaurant/categories/categories.module';
import { RestaurantMenuItemsModule } from './modules/restaurant/menu-items/menu-items.module';
import { RestaurantOrdersModule } from './modules/restaurant/orders/orders.module';
import { RestaurantDriversModule } from './modules/restaurant/drivers/drivers.module';
// Aesthetic
import { AestheticClientsModule } from './modules/aesthetic/clients/clients.module';
import { AestheticProceduresModule } from './modules/aesthetic/procedures/procedures.module';
import { AestheticAppointmentsModule } from './modules/aesthetic/appointments/appointments.module';
import { AestheticPackagesModule } from './modules/aesthetic/packages/packages.module';
import { AestheticBillingsModule } from './modules/aesthetic/billings/billings.module';
// Dental
import { DentalPatientsModule } from './modules/dental/patients/patients.module';
import { DentalDentistsModule } from './modules/dental/dentists/dentists.module';
import { DentalTreatmentsModule } from './modules/dental/treatments/treatments.module';
import { DentalAppointmentsModule } from './modules/dental/appointments/appointments.module';
import { DentalTreatmentPlansModule } from './modules/dental/treatment-plans/treatment-plans.module';
import { DentalBillingsModule } from './modules/dental/billings/billings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    LoggerModule,
    CacheModule,
    QueueModule,
    EmailModule,
    // Core
    AuthModule,
    TenantsModule,
    UsersModule,
    RolesModule,
    AuditModule,
    HealthModule,
    MetricsModule,
    NotificationsModule,
    BillingModule,
    AiModule,
    // Clinic
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    ClinicBillingModule,
    // Construction
    ProjectsModule,
    TasksModule,
    ExpensesModule,
    WorkersModule,
    // Barbershop
    BarbersModule,
    BarbershopServicesModule,
    BarbershopClientsModule,
    BookingsModule,
    ProductsModule,
    OrdersModule,
    // Real Estate
    RealEstatePropertiesModule,
    RealEstateClientsModule,
    RealEstateVisitsModule,
    RealEstateDealsModule,
    // Nutrition
    NutritionPatientsModule,
    NutritionPlansModule,
    NutritionMealsModule,
    NutritionAppointmentsModule,
    NutritionMeasurementsModule,
    // Legal
    LegalClientsModule,
    LegalCasesModule,
    LegalDocumentsModule,
    LegalTasksModule,
    LegalBillingsModule,
    // Restaurant
    RestaurantCategoriesModule,
    RestaurantMenuItemsModule,
    RestaurantOrdersModule,
    RestaurantDriversModule,
    // Aesthetic
    AestheticClientsModule,
    AestheticProceduresModule,
    AestheticAppointmentsModule,
    AestheticPackagesModule,
    AestheticBillingsModule,
    // Dental
    DentalPatientsModule,
    DentalDentistsModule,
    DentalTreatmentsModule,
    DentalAppointmentsModule,
    DentalTreatmentPlansModule,
    DentalBillingsModule,
  ],
})
export class AppModule {}

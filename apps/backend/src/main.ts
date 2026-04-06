import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { PrismaService } from './common/prisma/prisma.service';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const prismaService = app.get(PrismaService);
  app.useGlobalInterceptors(new AuditInterceptor(prismaService));

  const config = new DocumentBuilder()
    .setTitle('Vertix API')
    .setDescription('SaaS Multi-Vertical Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Tenants', 'Tenant management')
    .addTag('Users', 'User management')
    .addTag('Health', 'Health check')
    .addTag('Clinic - Patients', 'Patient management')
    .addTag('Clinic - Doctors', 'Doctor management')
    .addTag('Clinic - Appointments', 'Appointment management')
    .addTag('Clinic - Medical Records', 'Medical record management')
    .addTag('Clinic - Billing', 'Clinic billing management')
    .addTag('Construction - Projects', 'Project management')
    .addTag('Construction - Tasks', 'Task management')
    .addTag('Construction - Expenses', 'Expense management')
    .addTag('Construction - Workers', 'Worker management')
    .addTag('Barbershop - Barbers', 'Barber management')
    .addTag('Barbershop - Services', 'Service management')
    .addTag('Barbershop - Clients', 'Client management')
    .addTag('Barbershop - Bookings', 'Booking management')
    .addTag('Barbershop - Products', 'Product management')
    .addTag('Barbershop - Orders', 'Order management')
    .addTag('Real Estate - Properties', 'Property management')
    .addTag('Real Estate - Clients', 'Client management')
    .addTag('Real Estate - Visits', 'Visit management')
    .addTag('Real Estate - Deals', 'Deal management')
    .addTag('Nutrition - Patients', 'Patient management')
    .addTag('Nutrition - Plans', 'Plan management')
    .addTag('Nutrition - Meals', 'Meal management')
    .addTag('Nutrition - Appointments', 'Appointment management')
    .addTag('Nutrition - Measurements', 'Measurement management')
    .addTag('Legal - Clients', 'Client management')
    .addTag('Legal - Cases', 'Case management')
    .addTag('Legal - Documents', 'Document management')
    .addTag('Legal - Tasks', 'Task management')
    .addTag('Legal - Billings', 'Billing management')
    .addTag('Restaurant - Categories', 'Category management')
    .addTag('Restaurant - Menu Items', 'Menu item management')
    .addTag('Restaurant - Orders', 'Order management')
    .addTag('Restaurant - Drivers', 'Driver management')
    .addTag('Aesthetic - Clients', 'Client management')
    .addTag('Aesthetic - Procedures', 'Procedure management')
    .addTag('Aesthetic - Appointments', 'Appointment management')
    .addTag('Aesthetic - Packages', 'Package management')
    .addTag('Aesthetic - Billings', 'Billing management')
    .addTag('Dental - Patients', 'Patient management')
    .addTag('Dental - Dentists', 'Dentist management')
    .addTag('Dental - Treatments', 'Treatment management')
    .addTag('Dental - Appointments', 'Appointment management')
    .addTag('Dental - Treatment Plans', 'Treatment plan management')
    .addTag('Dental - Billings', 'Billing management')
    .addTag('AI', 'AI services')
    .addTag('Audit', 'Audit logs')
    .addTag('Notifications', 'Notifications')
    .addTag('Billing', 'Platform billing')
    .addTag('Roles', 'Role management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  console.log(`Vertix API running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();

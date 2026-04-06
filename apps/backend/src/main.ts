import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

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

  const config = new DocumentBuilder()
    .setTitle('NexusHub API')
    .setDescription('SaaS Multi-Vertical Platform - Clinic & Construction')
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  console.log(`NexusHub API running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();

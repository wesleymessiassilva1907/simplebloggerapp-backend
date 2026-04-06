import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    // Soft delete middleware - intercept delete operations
    this.$use(async (params, next) => {
      // Models that support soft delete (have deletedAt field)
      const softDeleteModels = [
        'ClinicPatient', 'ClinicDoctor', 'ClinicAppointment', 'ClinicMedicalRecord', 'ClinicBilling',
        'ConstructionProject', 'ConstructionTask', 'ConstructionExpense', 'ConstructionWorker',
        'BarbershopBarber', 'BarbershopClient', 'BarbershopBooking', 'BarbershopProduct', 'BarbershopOrder',
        'RealEstateProperty', 'RealEstateClient', 'RealEstateVisit', 'RealEstateDeal',
        'NutritionPatient', 'NutritionPlan', 'NutritionAppointment', 'NutritionMeasurement',
        'LegalClient', 'LegalCase', 'LegalDocument', 'LegalTask', 'LegalBilling',
        'RestaurantMenuItem', 'RestaurantOrder', 'RestaurantDriver',
        'AestheticClient', 'AestheticProcedure', 'AestheticAppointment', 'AestheticPackage', 'AestheticBilling',
        'DentalPatient', 'DentalDentist', 'DentalTreatment', 'DentalAppointment', 'DentalTreatmentPlan', 'DentalBilling',
        'User', 'AuditLog',
      ];

      if (softDeleteModels.includes(params.model || '')) {
        // Intercept delete -> update with deletedAt
        if (params.action === 'delete') {
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date() };
        }
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          if (params.args.data !== undefined) {
            params.args.data['deletedAt'] = new Date();
          } else {
            params.args['data'] = { deletedAt: new Date() };
          }
        }

        // Intercept findMany/findFirst -> add deletedAt: null filter
        if (params.action === 'findFirst' || params.action === 'findMany' || params.action === 'count') {
          if (!params.args) params.args = {};
          if (!params.args.where) params.args.where = {};
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null;
          }
        }
      }

      return next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

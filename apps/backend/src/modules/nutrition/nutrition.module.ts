import { Module } from '@nestjs/common';
import { NutritionPatientsModule } from './patients/patients.module';
import { NutritionPlansModule } from './plans/plans.module';
import { NutritionMealsModule } from './meals/meals.module';
import { NutritionAppointmentsModule } from './appointments/appointments.module';
import { NutritionMeasurementsModule } from './measurements/measurements.module';

@Module({
  imports: [
    NutritionPatientsModule,
    NutritionPlansModule,
    NutritionMealsModule,
    NutritionAppointmentsModule,
    NutritionMeasurementsModule,
  ],
})
export class NutritionModule {}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class CreateNutritionPlanDto {
  @ApiProperty({ example: 'uuid-do-paciente' }) @IsNotEmpty() @IsString() patientId: string;
  @ApiProperty({ example: 'Plano de emagrecimento - Fase 1' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Redução de gordura corporal' }) @IsOptional() @IsString() objective?: string;
  @ApiPropertyOptional({ example: 1800, description: 'Calorias diárias' }) @IsOptional() @IsNumber() dailyCalories?: number;
  @ApiPropertyOptional({ example: 120, description: 'Proteína diária em gramas' }) @IsOptional() @IsNumber() dailyProtein?: number;
  @ApiPropertyOptional({ example: 200, description: 'Carboidratos diários em gramas' }) @IsOptional() @IsNumber() dailyCarbs?: number;
  @ApiPropertyOptional({ example: 60, description: 'Gordura diária em gramas' }) @IsOptional() @IsNumber() dailyFat?: number;
  @ApiPropertyOptional({ example: '2026-04-01' }) @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ example: '2026-06-30' }) @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ example: 'active', enum: ['draft', 'active', 'completed', 'cancelled'] }) @IsOptional() @IsEnum(['draft', 'active', 'completed', 'cancelled']) status?: string;
  @ApiPropertyOptional({ example: 'Evitar carboidratos simples após 18h' }) @IsOptional() @IsString() notes?: string;
}

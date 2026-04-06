import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateNutritionMeasurementDto {
  @ApiProperty({ example: 'uuid-do-paciente' }) @IsNotEmpty() @IsString() patientId: string;
  @ApiProperty({ example: '2026-04-06', description: 'Data da medição' }) @IsNotEmpty() @IsDateString() date: string;
  @ApiPropertyOptional({ example: 71.5, description: 'Peso em kg' }) @IsOptional() @IsNumber() weight?: number;
  @ApiPropertyOptional({ example: 22.3, description: 'Percentual de gordura corporal' }) @IsOptional() @IsNumber() bodyFat?: number;
  @ApiPropertyOptional({ example: 35.2, description: 'Massa muscular em kg' }) @IsOptional() @IsNumber() muscleMass?: number;
  @ApiPropertyOptional({ example: 24.8, description: 'IMC' }) @IsOptional() @IsNumber() bmi?: number;
  @ApiPropertyOptional({ example: 78, description: 'Cintura em cm' }) @IsOptional() @IsNumber() waist?: number;
  @ApiPropertyOptional({ example: 95, description: 'Quadril em cm' }) @IsOptional() @IsNumber() hip?: number;
  @ApiPropertyOptional({ example: 30, description: 'Braço em cm' }) @IsOptional() @IsNumber() arm?: number;
  @ApiPropertyOptional({ example: 92, description: 'Peitoral em cm' }) @IsOptional() @IsNumber() chest?: number;
  @ApiPropertyOptional({ example: 55, description: 'Coxa em cm' }) @IsOptional() @IsNumber() thigh?: number;
  @ApiPropertyOptional({ example: 'Medição pós-treino' }) @IsOptional() @IsString() notes?: string;
}

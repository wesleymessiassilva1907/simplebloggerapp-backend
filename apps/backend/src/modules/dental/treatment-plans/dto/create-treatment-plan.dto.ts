import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsArray, ValidateNested, IsEnum, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export enum TreatmentPlanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateTreatmentPlanItemDto {
  @ApiProperty({ example: 'clx1234treatment' }) @IsNotEmpty() @IsString() treatmentId: string;
  @ApiPropertyOptional({ example: '18' }) @IsOptional() @IsString() toothNumber?: string;
  @ApiProperty({ example: 350.00 }) @IsNotEmpty() @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional({ example: 3, description: 'Numero de sessoes' }) @IsOptional() @IsInt() @Min(1) sessions?: number;
  @ApiPropertyOptional({ example: 'Restauracao com resina' }) @IsOptional() @IsString() notes?: string;
}

export class CreateDentalTreatmentPlanDto {
  @ApiProperty({ example: 'clx1234patient' }) @IsNotEmpty() @IsString() patientId: string;
  @ApiProperty({ example: 'clx1234dentist' }) @IsNotEmpty() @IsString() dentistId: string;
  @ApiProperty({ example: 'Plano de tratamento completo' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Tratamento para restauracao dos dentes posteriores' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: TreatmentPlanStatus, example: TreatmentPlanStatus.PENDING }) @IsOptional() @IsEnum(TreatmentPlanStatus) status?: TreatmentPlanStatus;
  @ApiPropertyOptional({ example: 50.00 }) @IsOptional() @IsNumber() @Min(0) discount?: number;
  @ApiPropertyOptional({ example: '2024-06-01' }) @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ example: '2024-12-31' }) @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ example: 'Paciente prefere sessoes quinzenais' }) @IsOptional() @IsString() notes?: string;

  @ApiProperty({ type: [CreateTreatmentPlanItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTreatmentPlanItemDto)
  items: CreateTreatmentPlanItemDto[];
}

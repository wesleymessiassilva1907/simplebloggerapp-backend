import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, IsEnum, Min } from 'class-validator';

export enum AppointmentType {
  CONSULTATION = 'consultation',
  TREATMENT = 'treatment',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  CLEANING = 'cleaning',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export class CreateDentalAppointmentDto {
  @ApiProperty({ example: 'clx1234patient' }) @IsNotEmpty() @IsString() patientId: string;
  @ApiProperty({ example: 'clx1234dentist' }) @IsNotEmpty() @IsString() dentistId: string;
  @ApiProperty({ example: '2024-06-15T14:00:00Z' }) @IsNotEmpty() @IsDateString() appointmentDate: string;
  @ApiPropertyOptional({ example: 30, description: 'Duracao em minutos' }) @IsOptional() @IsNumber() @Min(1) duration?: number;
  @ApiProperty({ enum: AppointmentType, example: AppointmentType.CONSULTATION }) @IsNotEmpty() @IsEnum(AppointmentType) type: AppointmentType;
  @ApiPropertyOptional({ enum: AppointmentStatus, example: AppointmentStatus.SCHEDULED }) @IsOptional() @IsEnum(AppointmentStatus) status?: AppointmentStatus;
  @ApiPropertyOptional({ example: '18', description: 'Numero do dente (notacao ISO)' }) @IsOptional() @IsString() toothNumber?: string;
  @ApiPropertyOptional({ example: 'Paciente com dor no dente 18' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ example: 'Carie profunda no dente 18' }) @IsOptional() @IsString() clinicalNotes?: string;
}

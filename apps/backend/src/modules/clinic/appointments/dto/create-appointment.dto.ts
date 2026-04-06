import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Patient ID' }) @IsNotEmpty() @IsString() patientId: string;
  @ApiProperty({ description: 'Doctor ID' }) @IsNotEmpty() @IsString() doctorId: string;
  @ApiProperty({ example: '2025-06-15T10:00:00Z' }) @IsNotEmpty() @IsDateString() appointmentDate: string;
  @ApiPropertyOptional({ example: 'scheduled' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: 'Patient complains of headache' }) @IsOptional() @IsString() notes?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateClinicBillingDto {
  @ApiProperty({ description: 'Patient ID' }) @IsNotEmpty() @IsString() patientId: string;
  @ApiPropertyOptional({ description: 'Appointment ID' }) @IsOptional() @IsString() appointmentId?: string;
  @ApiProperty({ example: 250.00 }) @IsNotEmpty() @IsNumber() amount: number;
  @ApiPropertyOptional({ example: 'pending' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: 'credit_card' }) @IsOptional() @IsString() paymentMethod?: string;
  @ApiPropertyOptional({ example: '2025-07-15' }) @IsOptional() @IsDateString() dueDate?: string;
}

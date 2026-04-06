import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'Patient ID' }) @IsNotEmpty() @IsString() patientId: string;
  @ApiProperty({ description: 'Doctor ID' }) @IsNotEmpty() @IsString() doctorId: string;
  @ApiPropertyOptional({ description: 'Appointment ID' }) @IsOptional() @IsString() appointmentId?: string;
  @ApiProperty({ example: 'Patient presents with persistent headache for 3 days' }) @IsNotEmpty() @IsString() description: string;
  @ApiPropertyOptional({ example: 'Tension headache' }) @IsOptional() @IsString() diagnosis?: string;
  @ApiPropertyOptional({ example: 'Paracetamol 750mg 8/8h' }) @IsOptional() @IsString() prescription?: string;
  @ApiPropertyOptional({ description: 'Attachment ID' }) @IsOptional() @IsString() attachmentId?: string;
}

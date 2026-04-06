import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsInt, IsArray, IsEnum, Min } from 'class-validator';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class CreateAestheticAppointmentDto {
  @ApiProperty({ example: 'clxyz123-client-id' }) @IsNotEmpty() @IsString() clientId: string;
  @ApiProperty({ example: 'clxyz456-procedure-id' }) @IsNotEmpty() @IsString() procedureId: string;
  @ApiPropertyOptional({ example: 'clxyz789-package-id' }) @IsOptional() @IsString() packageId?: string;
  @ApiProperty({ example: '2025-06-15T14:00:00.000Z' }) @IsNotEmpty() @IsDateString() appointmentDate: string;
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @IsInt() @Min(1) sessionNumber?: number;
  @ApiPropertyOptional({ example: 'SCHEDULED', enum: AppointmentStatus }) @IsOptional() @IsEnum(AppointmentStatus) status?: AppointmentStatus;
  @ApiPropertyOptional({ example: 'https://storage.example.com/before.jpg' }) @IsOptional() @IsString() beforePhoto?: string;
  @ApiPropertyOptional({ example: 'https://storage.example.com/after.jpg' }) @IsOptional() @IsString() afterPhoto?: string;
  @ApiPropertyOptional({ example: 'Paciente com pele sensível, usar produto hipoalergênico' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ example: 'Dra. Carla Souza' }) @IsOptional() @IsString() professional?: string;
  @ApiPropertyOptional({ example: [{ name: 'Ácido Hialurônico', quantity: 1 }] }) @IsOptional() @IsArray() productsUsed?: any;
}

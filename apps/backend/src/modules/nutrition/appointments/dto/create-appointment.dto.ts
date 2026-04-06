import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, IsEnum } from 'class-validator';

export class CreateNutritionAppointmentDto {
  @ApiProperty({ example: 'uuid-do-paciente' }) @IsNotEmpty() @IsString() patientId: string;
  @ApiProperty({ example: '2026-04-10T14:00:00.000Z', description: 'Data e hora da consulta' }) @IsNotEmpty() @IsDateString() appointmentDate: string;
  @ApiPropertyOptional({ example: 'first_visit', enum: ['first_visit', 'follow_up', 'return', 'online'] }) @IsOptional() @IsEnum(['first_visit', 'follow_up', 'return', 'online']) type?: string;
  @ApiPropertyOptional({ example: 'scheduled', enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] }) @IsOptional() @IsEnum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']) status?: string;
  @ApiPropertyOptional({ example: 72.3, description: 'Peso aferido na consulta (kg)' }) @IsOptional() @IsNumber() weight?: number;
  @ApiPropertyOptional({ example: 'Paciente relata dificuldade em seguir o plano nos finais de semana' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ example: 'Aumentar ingestão de água para 2.5L/dia' }) @IsOptional() @IsString() recommendations?: string;
}

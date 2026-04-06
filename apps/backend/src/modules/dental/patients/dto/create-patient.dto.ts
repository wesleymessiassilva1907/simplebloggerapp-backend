import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsDateString, IsObject, IsArray } from 'class-validator';

export class CreateDentalPatientDto {
  @ApiProperty({ example: 'Maria da Silva' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'maria@email.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: '(11) 99999-1234' }) @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ example: '123.456.789-00' }) @IsOptional() @IsString() cpf?: string;
  @ApiPropertyOptional({ example: '1985-03-20' }) @IsOptional() @IsDateString() birthDate?: string;
  @ApiPropertyOptional({ example: 'feminino' }) @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional({ example: 'Rua das Flores, 123 - SP' }) @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional({ example: 'Joao Silva - (11) 98888-0000' }) @IsOptional() @IsString() emergencyContact?: string;
  @ApiPropertyOptional({ example: { diabetes: false, hypertension: true } }) @IsOptional() @IsObject() medicalHistory?: any;
  @ApiPropertyOptional({ example: ['Penicilina', 'Dipirona'] }) @IsOptional() @IsArray() allergies?: any;
  @ApiPropertyOptional({ example: 'Paciente com sensibilidade nos dentes' }) @IsOptional() @IsString() notes?: string;
}

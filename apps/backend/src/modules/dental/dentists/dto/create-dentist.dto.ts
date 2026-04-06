import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsBoolean, IsArray, IsObject } from 'class-validator';

export class CreateDentalDentistDto {
  @ApiProperty({ example: 'Dr. Carlos Oliveira' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'carlos@clinica.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: '(11) 97777-2222' }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ example: 'CRO-SP 12345' }) @IsNotEmpty() @IsString() cro: string;
  @ApiPropertyOptional({ example: 'Ortodontia' }) @IsOptional() @IsString() specialty?: string;
  @ApiPropertyOptional({ example: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }) @IsOptional() @IsArray() workDays?: any;
  @ApiPropertyOptional({ example: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' } }) @IsOptional() @IsObject() workHours?: any;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsArray } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'Client ID' }) @IsNotEmpty() @IsString() clientId: string;
  @ApiProperty({ description: 'Barber ID' }) @IsNotEmpty() @IsString() barberId: string;
  @ApiProperty({ example: '2025-06-15T10:00:00Z' }) @IsNotEmpty() @IsDateString() bookingDate: string;
  @ApiPropertyOptional({ example: 'scheduled' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: 'Corte degradê' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ description: 'Array of service IDs', type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) serviceIds?: string[];
}

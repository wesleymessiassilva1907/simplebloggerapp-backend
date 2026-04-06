import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. Ana Santos' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'ana@clinic.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: 'Cardiologia' }) @IsOptional() @IsString() specialty?: string;
  @ApiPropertyOptional({ example: 'CRM/SP 123456' }) @IsOptional() @IsString() crm?: string;
  @ApiPropertyOptional({ example: '(11) 99999-1111' }) @IsOptional() @IsString() phone?: string;
}

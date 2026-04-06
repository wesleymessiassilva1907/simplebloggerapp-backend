import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsDateString } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'João da Silva' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: '123.456.789-00' }) @IsOptional() @IsString() cpf?: string;
  @ApiPropertyOptional({ example: '1990-05-15' }) @IsOptional() @IsDateString() birthDate?: string;
  @ApiPropertyOptional({ example: '(11) 99999-0000' }) @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ example: 'joao@email.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: 'Rua das Flores, 123' }) @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional({ example: 'Maria - (11) 98888-0000' }) @IsOptional() @IsString() emergencyContact?: string;
}

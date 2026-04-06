import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEmail } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({ example: 'Carlos Ferreira' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'carlos@email.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: '(11) 97777-0000' }) @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ example: 'Pedreiro' }) @IsOptional() @IsString() role?: string;
  @ApiPropertyOptional({ example: 250.00 }) @IsOptional() @IsNumber() dailyCost?: number;
}

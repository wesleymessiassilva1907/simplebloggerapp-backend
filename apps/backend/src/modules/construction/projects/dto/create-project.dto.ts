import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Edifício Residencial Aurora' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Construção de edifício residencial de 12 andares' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: '2025-01-15' }) @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ example: '2026-06-30' }) @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ example: 5000000 }) @IsOptional() @IsNumber() budget?: number;
  @ApiPropertyOptional({ example: 'planning' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: 'São Paulo, SP' }) @IsOptional() @IsString() location?: string;
}

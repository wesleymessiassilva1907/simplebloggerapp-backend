import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'Project ID' }) @IsNotEmpty() @IsString() projectId: string;
  @ApiProperty({ example: 'Fundação do bloco A' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Escavação e concretagem da fundação' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ description: 'Worker ID' }) @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional({ example: '2025-02-01' }) @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ example: '2025-03-15' }) @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ example: 'pending' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: 0 }) @IsOptional() @IsNumber() @Min(0) @Max(100) progressPercent?: number;
}

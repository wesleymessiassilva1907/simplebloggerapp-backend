import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Project ID' }) @IsNotEmpty() @IsString() projectId: string;
  @ApiProperty({ example: 'Compra de cimento Portland' }) @IsNotEmpty() @IsString() description: string;
  @ApiPropertyOptional({ example: 'material' }) @IsOptional() @IsString() category?: string;
  @ApiProperty({ example: 15000.00 }) @IsNotEmpty() @IsNumber() amount: number;
  @ApiProperty({ example: '2025-02-10' }) @IsNotEmpty() @IsDateString() expenseDate: string;
  @ApiPropertyOptional({ example: 'Cimentos Brasil Ltda' }) @IsOptional() @IsString() supplier?: string;
}

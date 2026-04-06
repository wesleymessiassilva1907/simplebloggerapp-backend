import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsDateString } from 'class-validator';

export class CreateLegalBillingDto {
  @ApiProperty({ example: 'uuid-do-cliente' }) @IsNotEmpty() @IsString() clientId: string;
  @ApiProperty({ example: 'uuid-do-processo' }) @IsNotEmpty() @IsString() caseId: string;
  @ApiProperty({ example: 'Honorários advocatícios - Petição inicial' }) @IsNotEmpty() @IsString() description: string;
  @ApiProperty({ example: 'honorarios', enum: ['honorarios', 'custas_processuais', 'pericia', 'deslocamento', 'consultoria', 'outro'] }) @IsNotEmpty() @IsString() type: string;
  @ApiPropertyOptional({ example: 5000.00, description: 'Valor total (calculado automaticamente para cobrança por hora)' }) @IsOptional() @IsNumber() amount?: number;
  @ApiPropertyOptional({ example: 8.5, description: 'Horas trabalhadas' }) @IsOptional() @IsNumber() hoursWorked?: number;
  @ApiPropertyOptional({ example: 350.00, description: 'Valor por hora' }) @IsOptional() @IsNumber() hourlyRate?: number;
  @ApiPropertyOptional({ example: 'pendente', enum: ['pendente', 'faturado', 'pago', 'atrasado', 'cancelado'] }) @IsOptional() @IsEnum(['pendente', 'faturado', 'pago', 'atrasado', 'cancelado']) status?: string;
  @ApiPropertyOptional({ example: '2024-04-30' }) @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional({ example: '2024-04-25' }) @IsOptional() @IsDateString() paidAt?: string;
}

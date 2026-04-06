import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsInt, IsDateString, IsEnum, Min } from 'class-validator';

export enum BillingStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CreateAestheticBillingDto {
  @ApiProperty({ example: 'clxyz123-client-id' }) @IsNotEmpty() @IsString() clientId: string;
  @ApiPropertyOptional({ example: 'Pacote Rejuvenescimento - Parcela 1/3' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 850.00 }) @IsNotEmpty() @IsNumber() @Min(0) amount: number;
  @ApiPropertyOptional({ example: 'PENDING', enum: BillingStatus }) @IsOptional() @IsEnum(BillingStatus) status?: BillingStatus;
  @ApiPropertyOptional({ example: 'PIX', enum: PaymentMethod }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @ApiPropertyOptional({ example: 3 }) @IsOptional() @IsInt() @Min(1) installments?: number;
  @ApiPropertyOptional({ example: '2025-07-15' }) @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional({ example: '2025-07-10T14:30:00.000Z' }) @IsOptional() @IsDateString() paidAt?: string;
}

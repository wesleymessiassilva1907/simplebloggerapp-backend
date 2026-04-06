import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsEnum, IsInt, Min } from 'class-validator';

export enum BillingStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer',
  INSURANCE = 'insurance',
}

export class CreateDentalBillingDto {
  @ApiProperty({ example: 'clx1234patient' }) @IsNotEmpty() @IsString() patientId: string;
  @ApiProperty({ example: 'Limpeza dental + restauracao dente 18' }) @IsNotEmpty() @IsString() description: string;
  @ApiProperty({ example: 450.00 }) @IsNotEmpty() @IsNumber() @Min(0) amount: number;
  @ApiPropertyOptional({ enum: BillingStatus, example: BillingStatus.PENDING }) @IsOptional() @IsEnum(BillingStatus) status?: BillingStatus;
  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.PIX }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @ApiPropertyOptional({ example: 3, description: 'Numero de parcelas' }) @IsOptional() @IsInt() @Min(1) installments?: number;
  @ApiPropertyOptional({ example: '2024-07-15' }) @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional({ example: '2024-06-20T10:30:00Z' }) @IsOptional() @IsDateString() paidAt?: string;
}

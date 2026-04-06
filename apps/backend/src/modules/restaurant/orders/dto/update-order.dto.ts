import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsInt, Min } from 'class-validator';
import { OrderChannel, PaymentMethod } from './create-order.dto';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  CANCELLED = 'canceled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export class UpdateRestaurantOrderDto {
  @ApiPropertyOptional({ example: 'João da Silva' }) @IsOptional() @IsString() customerName?: string;
  @ApiPropertyOptional({ example: '11987654321' }) @IsOptional() @IsString() customerPhone?: string;
  @ApiPropertyOptional({ example: 'Rua das Flores, 123' }) @IsOptional() @IsString() customerAddress?: string;
  @ApiPropertyOptional({ example: 'ifood', enum: OrderChannel }) @IsOptional() @IsEnum(OrderChannel) channel?: OrderChannel;
  @ApiPropertyOptional({ example: 'confirmed', enum: OrderStatus }) @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @ApiPropertyOptional({ example: 5.00 }) @IsOptional() @IsNumber() @Min(0) deliveryFee?: number;
  @ApiPropertyOptional({ example: 0 }) @IsOptional() @IsNumber() @Min(0) discount?: number;
  @ApiPropertyOptional({ example: 'pix', enum: PaymentMethod }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @ApiPropertyOptional({ example: 'paid', enum: PaymentStatus }) @IsOptional() @IsEnum(PaymentStatus) paymentStatus?: PaymentStatus;
  @ApiPropertyOptional({ example: 'cldriver123' }) @IsOptional() @IsString() driverId?: string;
  @ApiPropertyOptional({ example: 'Entregar no portão lateral' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ example: 40 }) @IsOptional() @IsInt() @Min(1) estimatedTime?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'clxyz456' }) @IsNotEmpty() @IsString() menuItemId: string;
  @ApiProperty({ example: 2 }) @IsNotEmpty() @IsInt() @Min(1) quantity: number;
  @ApiPropertyOptional({ example: 'Sem cebola, por favor' }) @IsOptional() @IsString() notes?: string;
}

export enum OrderChannel {
  BALCAO = 'balcao',
  IFOOD = 'ifood',
  RAPPI = 'rappi',
  UBEREATS = 'ubereats',
  WHATSAPP = 'whatsapp',
  TELEFONE = 'telefone',
  SITE = 'site',
}

export enum PaymentMethod {
  DINHEIRO = 'dinheiro',
  CARTAO_CREDITO = 'cartao_credito',
  CARTAO_DEBITO = 'cartao_debito',
  PIX = 'pix',
  VALE_REFEICAO = 'vale_refeicao',
  ONLINE = 'online',
}

export class CreateRestaurantOrderDto {
  @ApiProperty({ example: 'João da Silva' }) @IsNotEmpty() @IsString() customerName: string;
  @ApiPropertyOptional({ example: '11987654321' }) @IsOptional() @IsString() customerPhone?: string;
  @ApiPropertyOptional({ example: 'Rua das Flores, 123 - Apto 45, Centro' }) @IsOptional() @IsString() customerAddress?: string;
  @ApiProperty({ example: 'ifood', enum: OrderChannel }) @IsNotEmpty() @IsEnum(OrderChannel) channel: OrderChannel;
  @ApiPropertyOptional({ example: 0 }) @IsOptional() @IsNumber() @Min(0) deliveryFee?: number;
  @ApiPropertyOptional({ example: 0 }) @IsOptional() @IsNumber() @Min(0) discount?: number;
  @ApiPropertyOptional({ example: 'pix', enum: PaymentMethod }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @ApiPropertyOptional({ example: 'cldriver123' }) @IsOptional() @IsString() driverId?: string;
  @ApiPropertyOptional({ example: 'Entregar no portão lateral' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ example: 40, description: 'Tempo estimado em minutos' }) @IsOptional() @IsInt() @Min(1) estimatedTime?: number;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

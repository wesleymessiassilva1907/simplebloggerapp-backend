import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiPropertyOptional({ description: 'Product ID (optional)' }) @IsOptional() @IsString() productId?: string;
  @ApiProperty({ example: 'Pomada Modeladora' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @IsInt() @Min(1) quantity?: number;
  @ApiProperty({ example: 45 }) @IsNotEmpty() @IsNumber() price: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Client ID' }) @IsOptional() @IsString() clientId?: string;
  @ApiPropertyOptional({ description: 'Barber ID' }) @IsOptional() @IsString() barberId?: string;
  @ApiProperty({ example: 90 }) @IsNotEmpty() @IsNumber() totalAmount: number;
  @ApiPropertyOptional({ example: 'pix' }) @IsOptional() @IsString() paymentMethod?: string;
  @ApiPropertyOptional({ example: 'pending' }) @IsOptional() @IsString() status?: string;
  @ApiProperty({ type: [OrderItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto) items: OrderItemDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsInt, IsArray, Min } from 'class-validator';

export class CreateRestaurantMenuItemDto {
  @ApiProperty({ example: 'clxyz123' }) @IsNotEmpty() @IsString() categoryId: string;
  @ApiProperty({ example: 'Pizza Margherita' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Molho de tomate, mussarela de búfala e manjericão fresco' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 39.90 }) @IsNotEmpty() @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional({ example: 'https://exemplo.com/pizza-margherita.jpg' }) @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional({ example: 25, description: 'Tempo de preparo em minutos' }) @IsOptional() @IsInt() @Min(1) prepTime?: number;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isAvailable?: boolean;
  @ApiPropertyOptional({ example: false }) @IsOptional() @IsBoolean() isPromotion?: boolean;
  @ApiPropertyOptional({ example: 29.90 }) @IsOptional() @IsNumber() @Min(0) promotionPrice?: number;
  @ApiPropertyOptional({ example: ['farinha de trigo', 'mussarela', 'tomate', 'manjericão'] }) @IsOptional() @IsArray() ingredients?: any;
  @ApiPropertyOptional({ example: ['glúten', 'lactose'] }) @IsOptional() @IsArray() allergens?: any;
  @ApiPropertyOptional({ example: 850 }) @IsOptional() @IsInt() @Min(0) calories?: number;
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}

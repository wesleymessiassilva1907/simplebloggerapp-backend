import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateRestaurantCategoryDto {
  @ApiProperty({ example: 'Pizzas' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Pizzas artesanais com massa fresca' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

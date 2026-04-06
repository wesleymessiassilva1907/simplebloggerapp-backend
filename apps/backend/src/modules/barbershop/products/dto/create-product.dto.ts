import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Pomada Modeladora' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Pomada efeito matte 150g' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 45 }) @IsNotEmpty() @IsNumber() price: number;
  @ApiPropertyOptional({ example: 20 }) @IsOptional() @IsInt() @Min(0) stock?: number;
  @ApiPropertyOptional({ example: 'pomada' }) @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

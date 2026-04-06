import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateRestaurantDriverDto {
  @ApiProperty({ example: 'Carlos Silva' }) @IsNotEmpty() @IsString() name: string;
  @ApiProperty({ example: '11987654321' }) @IsNotEmpty() @IsString() phone: string;
  @ApiPropertyOptional({ example: 'Moto Honda CG 160' }) @IsOptional() @IsString() vehicle?: string;
  @ApiPropertyOptional({ example: 'ABC-1D23' }) @IsOptional() @IsString() licensePlate?: string;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isAvailable?: boolean;
  @ApiPropertyOptional({ example: 'active' }) @IsOptional() @IsString() status?: string;
}

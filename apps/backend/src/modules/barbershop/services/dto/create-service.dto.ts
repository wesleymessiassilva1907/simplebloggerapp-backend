import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateBarbershopServiceDto {
  @ApiProperty({ example: 'Corte Masculino' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Corte tradicional com máquina e tesoura' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 45 }) @IsNotEmpty() @IsNumber() price: number;
  @ApiProperty({ example: 30, description: 'Duration in minutes' }) @IsNotEmpty() @IsInt() @Min(1) duration: number;
  @ApiPropertyOptional({ example: 'corte' }) @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

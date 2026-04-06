import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 'pix' }) @IsOptional() @IsString() paymentMethod?: string;
  @ApiPropertyOptional({ example: 'paid' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: 90 }) @IsOptional() @IsNumber() totalAmount?: number;
}

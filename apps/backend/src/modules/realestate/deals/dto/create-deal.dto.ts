import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class CreateDealDto {
  @ApiProperty({ example: 'clxyz123-property-id' }) @IsNotEmpty() @IsString() propertyId: string;
  @ApiProperty({ example: 'clxyz456-client-id' }) @IsNotEmpty() @IsString() clientId: string;
  @ApiProperty({ example: 'sale' }) @IsNotEmpty() @IsString() type: string;
  @ApiProperty({ example: 4500000 }) @IsNotEmpty() @IsNumber() @Min(0) value: number;
  @ApiProperty({ example: 5 }) @IsNotEmpty() @IsNumber() @Min(0) @Max(100) commissionPercent: number;
  @ApiPropertyOptional({ example: 'pending' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: '2026-04-15' }) @IsOptional() @IsDateString() contractDate?: string;
  @ApiPropertyOptional({ example: '2026-05-15' }) @IsOptional() @IsDateString() closingDate?: string;
  @ApiPropertyOptional({ example: 'Escritura será lavrada no 5º Ofício de Notas' }) @IsOptional() @IsString() notes?: string;
}

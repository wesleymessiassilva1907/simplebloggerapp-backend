import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class CreateVisitDto {
  @ApiProperty({ example: 'clxyz123-property-id' }) @IsNotEmpty() @IsString() propertyId: string;
  @ApiProperty({ example: 'clxyz456-client-id' }) @IsNotEmpty() @IsString() clientId: string;
  @ApiProperty({ example: '2026-04-10T14:00:00Z' }) @IsNotEmpty() @IsDateString() visitDate: string;
  @ApiPropertyOptional({ example: 'scheduled' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: 'Cliente gostou muito da varanda e da vista' }) @IsOptional() @IsString() feedback?: string;
  @ApiPropertyOptional({ example: 5 }) @IsOptional() @IsNumber() @Min(1) @Max(5) rating?: number;
  @ApiPropertyOptional({ example: 'Levar documentação do condomínio na próxima visita' }) @IsOptional() @IsString() notes?: string;
}

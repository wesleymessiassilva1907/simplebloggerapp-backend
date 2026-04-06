import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';

export enum TreatmentCategory {
  PREVENTIVE = 'preventive',
  RESTORATIVE = 'restorative',
  COSMETIC = 'cosmetic',
  ORTHODONTIC = 'orthodontic',
  SURGICAL = 'surgical',
  ENDODONTIC = 'endodontic',
}

export class CreateDentalTreatmentDto {
  @ApiProperty({ example: 'Limpeza Dental' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Limpeza completa com ultrassom e polimento' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: TreatmentCategory, example: TreatmentCategory.PREVENTIVE }) @IsNotEmpty() @IsEnum(TreatmentCategory) category: TreatmentCategory;
  @ApiPropertyOptional({ example: 60, description: 'Duration in minutes' }) @IsOptional() @IsNumber() @Min(1) duration?: number;
  @ApiPropertyOptional({ example: 250.00 }) @IsOptional() @IsNumber() @Min(0) price?: number;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() toothRelated?: boolean;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

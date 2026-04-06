import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateNutritionMealDto {
  @ApiProperty({ example: 'uuid-do-plano' }) @IsNotEmpty() @IsString() planId: string;
  @ApiProperty({ example: 'Café da manhã' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: '07:00' }) @IsOptional() @IsString() time?: string;
  @ApiPropertyOptional({
    example: [
      { name: 'Ovo cozido', quantity: 2, unit: 'unidade', calories: 140, protein: 12, carbs: 1, fat: 10 },
      { name: 'Pão integral', quantity: 1, unit: 'fatia', calories: 70, protein: 3, carbs: 12, fat: 1 },
    ],
    description: 'Lista de alimentos da refeição',
  })
  @IsOptional() @IsArray() foods?: any;
  @ApiPropertyOptional({ example: 'Pode substituir ovo por queijo branco' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ example: 1, description: 'Ordem de exibição' }) @IsOptional() @IsNumber() sortOrder?: number;
}

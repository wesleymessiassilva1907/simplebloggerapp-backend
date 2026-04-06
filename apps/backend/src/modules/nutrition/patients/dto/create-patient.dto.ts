import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsDateString, IsNumber, IsEnum, IsArray } from 'class-validator';

export class CreateNutritionPatientDto {
  @ApiProperty({ example: 'Maria Silva' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'maria@email.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: '(11) 99999-1234' }) @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ example: '123.456.789-00' }) @IsOptional() @IsString() cpf?: string;
  @ApiPropertyOptional({ example: '1990-03-15' }) @IsOptional() @IsDateString() birthDate?: string;
  @ApiPropertyOptional({ example: 'female', enum: ['male', 'female', 'other'] }) @IsOptional() @IsEnum(['male', 'female', 'other']) gender?: string;
  @ApiPropertyOptional({ example: 1.65, description: 'Altura em metros' }) @IsOptional() @IsNumber() height?: number;
  @ApiPropertyOptional({ example: 72.5, description: 'Peso atual em kg' }) @IsOptional() @IsNumber() currentWeight?: number;
  @ApiPropertyOptional({ example: 65.0, description: 'Peso alvo em kg' }) @IsOptional() @IsNumber() targetWeight?: number;
  @ApiPropertyOptional({ example: ['lactose', 'glúten'], description: 'Lista de alergias' }) @IsOptional() @IsArray() allergies?: any;
  @ApiPropertyOptional({ example: ['vegetariano'], description: 'Restrições alimentares' }) @IsOptional() @IsArray() restrictions?: any;
  @ApiPropertyOptional({ example: 'Emagrecimento saudável' }) @IsOptional() @IsString() objective?: string;
  @ApiPropertyOptional({ example: 'Paciente com histórico de diabetes na família' }) @IsOptional() @IsString() notes?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsInt, IsBoolean, IsArray, Min } from 'class-validator';

export class CreateAestheticProcedureDto {
  @ApiProperty({ example: 'Limpeza de Pele Profunda' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Limpeza completa com extração e máscara calmante' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: 'Facial' }) @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ example: 60, description: 'Duração em minutos' }) @IsOptional() @IsInt() @Min(1) duration?: number;
  @ApiPropertyOptional({ example: 250.00 }) @IsOptional() @IsNumber() @Min(0) price?: number;
  @ApiPropertyOptional({ example: 80.00 }) @IsOptional() @IsNumber() @Min(0) costPerSession?: number;
  @ApiPropertyOptional({ example: 4 }) @IsOptional() @IsInt() @Min(1) sessionsNeeded?: number;
  @ApiPropertyOptional({ example: 30, description: 'Intervalo entre sessões em dias' }) @IsOptional() @IsInt() @Min(1) interval?: number;
  @ApiPropertyOptional({ example: ['Gestante', 'Pele com lesões ativas'] }) @IsOptional() @IsArray() contraindications?: any;
  @ApiPropertyOptional({ example: 'Evitar exposição solar por 48h. Usar protetor solar FPS 50.' }) @IsOptional() @IsString() aftercare?: string;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

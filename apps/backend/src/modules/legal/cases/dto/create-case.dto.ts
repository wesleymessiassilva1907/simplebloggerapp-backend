import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsDateString } from 'class-validator';

export class CreateLegalCaseDto {
  @ApiProperty({ example: 'uuid-do-cliente' }) @IsNotEmpty() @IsString() clientId: string;
  @ApiProperty({ example: '0001234-56.2024.8.26.0100' }) @IsNotEmpty() @IsString() caseNumber: string;
  @ApiProperty({ example: 'Ação de Indenização por Danos Morais' }) @IsNotEmpty() @IsString() title: string;
  @ApiPropertyOptional({ example: 'Processo referente a danos morais sofridos pelo cliente em relação contratual' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 'civil', enum: ['civil', 'criminal', 'trabalhista', 'tributario', 'familia', 'consumidor', 'empresarial', 'ambiental', 'administrativo', 'outro'] }) @IsNotEmpty() @IsString() type: string;
  @ApiPropertyOptional({ example: '2ª Vara Cível do Foro Central - SP' }) @IsOptional() @IsString() court?: string;
  @ApiPropertyOptional({ example: 'Dr. Carlos Oliveira' }) @IsOptional() @IsString() judge?: string;
  @ApiPropertyOptional({ example: 'em_andamento', enum: ['novo', 'em_andamento', 'aguardando_audiencia', 'aguardando_sentenca', 'recurso', 'arquivado', 'encerrado'] }) @IsOptional() @IsEnum(['novo', 'em_andamento', 'aguardando_audiencia', 'aguardando_sentenca', 'recurso', 'arquivado', 'encerrado']) status?: string;
  @ApiPropertyOptional({ example: 'alta', enum: ['baixa', 'media', 'alta', 'urgente'] }) @IsOptional() @IsEnum(['baixa', 'media', 'alta', 'urgente']) priority?: string;
  @ApiPropertyOptional({ example: 50000.00 }) @IsOptional() @IsNumber() value?: number;
  @ApiPropertyOptional({ example: '2024-01-15' }) @IsOptional() @IsDateString() filingDate?: string;
  @ApiPropertyOptional({ example: '2024-06-20' }) @IsOptional() @IsDateString() nextHearingDate?: string;
  @ApiPropertyOptional({ example: 'Primeira audiência de conciliação agendada' }) @IsOptional() @IsString() notes?: string;
}

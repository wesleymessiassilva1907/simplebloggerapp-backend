import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class CreateLegalTaskDto {
  @ApiProperty({ example: 'uuid-do-processo' }) @IsNotEmpty() @IsString() caseId: string;
  @ApiProperty({ example: 'Elaborar petição inicial' }) @IsNotEmpty() @IsString() title: string;
  @ApiPropertyOptional({ example: 'Redigir petição inicial com base nos documentos fornecidos pelo cliente' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 'peticao', enum: ['peticao', 'audiencia', 'prazo', 'reuniao', 'diligencia', 'pesquisa', 'revisao', 'outro'] }) @IsNotEmpty() @IsString() type: string;
  @ApiProperty({ example: '2024-03-15' }) @IsNotEmpty() @IsDateString() dueDate: string;
  @ApiPropertyOptional({ example: 'pendente', enum: ['pendente', 'em_andamento', 'concluida', 'cancelada', 'atrasada'] }) @IsOptional() @IsEnum(['pendente', 'em_andamento', 'concluida', 'cancelada', 'atrasada']) status?: string;
  @ApiPropertyOptional({ example: 'alta', enum: ['baixa', 'media', 'alta', 'urgente'] }) @IsOptional() @IsEnum(['baixa', 'media', 'alta', 'urgente']) priority?: string;
  @ApiPropertyOptional({ example: 'uuid-do-usuario-responsavel' }) @IsOptional() @IsString() assignedTo?: string;
}

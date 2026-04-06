import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';

export class CreateLegalDocumentDto {
  @ApiProperty({ example: 'uuid-do-processo' }) @IsNotEmpty() @IsString() caseId: string;
  @ApiProperty({ example: 'Petição Inicial - Danos Morais' }) @IsNotEmpty() @IsString() title: string;
  @ApiProperty({ example: 'peticao', enum: ['peticao', 'contestacao', 'recurso', 'contrato', 'procuracao', 'alvara', 'sentenca', 'acordao', 'parecer', 'notificacao', 'outro'] }) @IsNotEmpty() @IsString() type: string;
  @ApiPropertyOptional({ example: 'Conteúdo do documento em texto' }) @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional({ example: '/uploads/legal/peticao-inicial.pdf' }) @IsOptional() @IsString() filePath?: string;
  @ApiPropertyOptional({ example: 524288 }) @IsOptional() @IsNumber() fileSize?: number;
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @IsNumber() version?: number;
  @ApiPropertyOptional({ example: 'rascunho', enum: ['rascunho', 'revisao', 'aprovado', 'protocolado', 'arquivado'] }) @IsOptional() @IsEnum(['rascunho', 'revisao', 'aprovado', 'protocolado', 'arquivado']) status?: string;
}

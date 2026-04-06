import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';

export class CreateLegalClientDto {
  @ApiProperty({ example: 'Maria Silva Santos' }) @IsNotEmpty() @IsString() name: string;
  @ApiProperty({ example: 'maria.silva@email.com' }) @IsNotEmpty() @IsEmail() email: string;
  @ApiPropertyOptional({ example: '(11) 99999-8888' }) @IsOptional() @IsString() phone?: string;
  @ApiProperty({ example: '123.456.789-00', description: 'CPF ou CNPJ do cliente' }) @IsNotEmpty() @IsString() cpfCnpj: string;
  @ApiProperty({ example: 'pessoa_fisica', enum: ['pessoa_fisica', 'pessoa_juridica'] }) @IsNotEmpty() @IsEnum(['pessoa_fisica', 'pessoa_juridica']) type: string;
  @ApiPropertyOptional({ example: 'Rua das Flores, 123 - São Paulo/SP' }) @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional({ example: 'Cliente indicado pelo Dr. João' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ example: 'active', enum: ['active', 'inactive', 'archived'] }) @IsOptional() @IsEnum(['active', 'inactive', 'archived']) status?: string;
}

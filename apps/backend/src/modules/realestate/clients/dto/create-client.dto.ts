import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsNumber, Min } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Maria Fernanda Silva' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'maria.silva@email.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: '(21) 99999-8888' }) @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ example: '123.456.789-00' }) @IsOptional() @IsString() cpf?: string;
  @ApiProperty({ example: 'buyer' }) @IsNotEmpty() @IsString() type: string;
  @ApiPropertyOptional({ example: 5000000 }) @IsOptional() @IsNumber() @Min(0) budget?: number;
  @ApiPropertyOptional({ example: 'Busca cobertura no Leblon ou Ipanema, mínimo 3 quartos' }) @IsOptional() @IsString() preferences?: string;
  @ApiPropertyOptional({ example: 'indicação' }) @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional({ example: 'active' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: 'Cliente VIP, prefere atendimento no período da manhã' }) @IsOptional() @IsString() notes?: string;
}

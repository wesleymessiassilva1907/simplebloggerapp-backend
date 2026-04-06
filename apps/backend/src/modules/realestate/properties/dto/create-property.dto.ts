import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, Min } from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Cobertura Duplex no Leblon' }) @IsNotEmpty() @IsString() title: string;
  @ApiPropertyOptional({ example: 'Cobertura duplex com vista para o mar, acabamento de alto padrão' }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 'apartment' }) @IsNotEmpty() @IsString() type: string;
  @ApiPropertyOptional({ example: 'available' }) @IsOptional() @IsString() status?: string;
  @ApiProperty({ example: 4500000 }) @IsNotEmpty() @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional({ example: 320 }) @IsOptional() @IsNumber() @Min(0) area?: number;
  @ApiPropertyOptional({ example: 4 }) @IsOptional() @IsNumber() @Min(0) bedrooms?: number;
  @ApiPropertyOptional({ example: 3 }) @IsOptional() @IsNumber() @Min(0) bathrooms?: number;
  @ApiPropertyOptional({ example: 2 }) @IsOptional() @IsNumber() @Min(0) parkingSpots?: number;
  @ApiPropertyOptional({ example: 'Av. Delfim Moreira, 1000' }) @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional({ example: 'Leblon' }) @IsOptional() @IsString() neighborhood?: string;
  @ApiPropertyOptional({ example: 'Rio de Janeiro' }) @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional({ example: 'RJ' }) @IsOptional() @IsString() state?: string;
  @ApiPropertyOptional({ example: '22441-000' }) @IsOptional() @IsString() zipCode?: string;
  @ApiPropertyOptional({ example: ['Piscina', 'Varanda gourmet', 'Vista mar'] }) @IsOptional() @IsArray() features?: string[];
  @ApiPropertyOptional({ example: ['https://example.com/img1.jpg'] }) @IsOptional() @IsArray() images?: string[];
  @ApiPropertyOptional({ example: 'Condomínio Residencial Atlântico' }) @IsOptional() @IsString() condominium?: string;
  @ApiPropertyOptional({ example: 12000 }) @IsOptional() @IsNumber() @Min(0) iptu?: number;
}

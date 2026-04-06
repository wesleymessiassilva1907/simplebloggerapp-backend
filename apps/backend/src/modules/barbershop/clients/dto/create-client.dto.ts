import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsDateString } from 'class-validator';

export class CreateBarbershopClientDto {
  @ApiProperty({ example: 'Lucas Mendes' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: '(11) 98888-1111' }) @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ example: 'lucas@email.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: '1990-05-15' }) @IsOptional() @IsDateString() birthDate?: string;
  @ApiPropertyOptional({ example: 'Prefere corte degradê' }) @IsOptional() @IsString() notes?: string;
}

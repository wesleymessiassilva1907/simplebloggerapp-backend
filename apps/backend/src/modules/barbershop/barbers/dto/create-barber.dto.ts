import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsNumber, IsBoolean } from 'class-validator';

export class CreateBarberDto {
  @ApiProperty({ example: 'Carlos Silva' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'carlos@barbearia.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: '(11) 99999-1111' }) @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ example: 'corte' }) @IsOptional() @IsString() specialty?: string;
  @ApiPropertyOptional({ example: 50 }) @IsOptional() @IsNumber() commission?: number;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' }) @IsOptional() @IsString() avatarUrl?: string;
}

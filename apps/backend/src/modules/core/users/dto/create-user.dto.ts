import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria Silva' }) @IsNotEmpty() name: string;
  @ApiProperty({ example: 'maria@clinic.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'Pass@123' }) @IsNotEmpty() @MinLength(6) password: string;
  @ApiPropertyOptional() @IsOptional() @IsString() roleId?: string;
}

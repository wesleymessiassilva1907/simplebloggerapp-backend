import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsDateString, IsBoolean, IsArray, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum SkinType {
  TIPO_I = 'TIPO_I',
  TIPO_II = 'TIPO_II',
  TIPO_III = 'TIPO_III',
  TIPO_IV = 'TIPO_IV',
  TIPO_V = 'TIPO_V',
  TIPO_VI = 'TIPO_VI',
}

export class CreateAestheticClientDto {
  @ApiProperty({ example: 'Maria Silva' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'maria@email.com' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: '(11) 99999-1234' }) @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ example: '123.456.789-00' }) @IsOptional() @IsString() cpf?: string;
  @ApiPropertyOptional({ example: '1988-03-20' }) @IsOptional() @IsDateString() birthDate?: string;
  @ApiPropertyOptional({ example: 'FEMALE', enum: Gender }) @IsOptional() @IsEnum(Gender) gender?: Gender;
  @ApiPropertyOptional({ example: 'TIPO_III', enum: SkinType }) @IsOptional() @IsEnum(SkinType) skinType?: SkinType;
  @ApiPropertyOptional({ example: { alergias: 'Nenhuma', cirurgias: 'Rinoplastia 2020' } }) @IsOptional() medicalHistory?: any;
  @ApiPropertyOptional({ example: ['Gestante', 'Marcapasso'] }) @IsOptional() @IsArray() contraindications?: any;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() photoConsent?: boolean;
  @ApiPropertyOptional({ example: 'Cliente indicada pela Dra. Ana' }) @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ example: 'Instagram' }) @IsOptional() @IsString() source?: string;
}

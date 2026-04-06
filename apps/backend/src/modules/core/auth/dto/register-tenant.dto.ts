import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterTenantDto {
  @ApiProperty({ example: 'Clínica São Paulo' })
  @IsNotEmpty()
  tenantName: string;

  @ApiProperty({ example: 'clinica-sao-paulo' })
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers and hyphens' })
  tenantSlug: string;

  @ApiProperty({ example: 'Dr. João Silva' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@clinica.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass@123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

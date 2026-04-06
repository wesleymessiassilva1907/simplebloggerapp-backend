import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewPass@123' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

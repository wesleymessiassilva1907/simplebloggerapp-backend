import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsInt, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PackageProcedureDto {
  @ApiProperty({ example: 'clxyz456-procedure-id' }) @IsNotEmpty() @IsString() procedureId: string;
  @ApiProperty({ example: 4 }) @IsNotEmpty() @IsInt() @Min(1) sessions: number;
}

export class CreateAestheticPackageDto {
  @ApiProperty({ example: 'Pacote Rejuvenescimento Completo' }) @IsNotEmpty() @IsString() name: string;
  @ApiPropertyOptional({ example: 'Inclui limpeza de pele, peeling e botox' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: 2500.00 }) @IsOptional() @IsNumber() @Min(0) totalPrice?: number;
  @ApiPropertyOptional({ example: 12 }) @IsOptional() @IsInt() @Min(1) totalSessions?: number;
  @ApiPropertyOptional({ example: 180, description: 'Validade em dias' }) @IsOptional() @IsInt() @Min(1) validityDays?: number;
  @ApiPropertyOptional({ example: 15.0, description: 'Desconto percentual' }) @IsOptional() @IsNumber() @Min(0) discount?: number;
  @ApiPropertyOptional({ example: true }) @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional({ type: [PackageProcedureDto], example: [{ procedureId: 'clxyz456', sessions: 4 }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageProcedureDto)
  procedures?: PackageProcedureDto[];
}

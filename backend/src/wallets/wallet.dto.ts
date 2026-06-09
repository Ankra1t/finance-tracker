import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({ example: 'Main Bank Account' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: '🏦' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#4CAF50' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateWalletDto {
  @ApiPropertyOptional({ example: 'Main Bank Account' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: '🏦' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#4CAF50' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class TransferDto {
  @ApiProperty()
  @IsString()
  fromWalletId: string;

  @ApiProperty()
  @IsString()
  toWalletId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
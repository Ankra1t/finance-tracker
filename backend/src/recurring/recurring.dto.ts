import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsUUID, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecurringFrequency } from './recurring.entity';

export class CreateRecurringDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'Monthly rent' })
  @IsString()
  description: string;

  @ApiProperty({ enum: RecurringFrequency })
  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty()
  @IsUUID()
  walletId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdateRecurringDto {
  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ example: 'Monthly rent' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: RecurringFrequency })
  @IsOptional()
  @IsEnum(RecurringFrequency)
  frequency?: RecurringFrequency;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
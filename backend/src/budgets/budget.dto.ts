import { IsString, IsNumber, IsEnum, IsUUID, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetPeriod } from './budget.entity';

export class CreateBudgetDto {
  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: BudgetPeriod })
  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsUUID()
  walletId: string;
}

export class UpdateBudgetDto {
  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ enum: BudgetPeriod })
  @IsOptional()
  @IsEnum(BudgetPeriod)
  period?: BudgetPeriod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  walletId?: string;
}

export class BudgetProgressDto {
  @ApiProperty()
  budgetId: string;

  @ApiProperty()
  budgetAmount: number;

  @ApiProperty()
  spent: number;

  @ApiProperty()
  remaining: number;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  isOverBudget: boolean;

  @ApiProperty()
  isNearLimit: boolean; // > 80%
}
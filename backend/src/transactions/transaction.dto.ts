import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from './transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ example: 100.50 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'Lunch with friends' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-05-23' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty()
  @IsUUID()
  walletId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  recurringId?: string;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 100.50 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ example: 'Lunch with friends' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-23' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  walletId?: string;
}

export class TransactionFiltersDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class TransactionStatsDto {
  @ApiProperty()
  totalIncome: number;

  @ApiProperty()
  totalExpense: number;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  transactionCount: number;

  @ApiProperty()
  byCategory: { categoryId: string; categoryName: string; amount: number; count: number }[];

  @ApiProperty()
  byMonth: { month: string; income: number; expense: number }[];
}

export class ExportQueryDto {
  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
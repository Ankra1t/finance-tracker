import { IsString, IsNumber, IsIn, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 100.50 })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['income', 'expense'] })
  @IsIn(['income', 'expense'])
  type: 'income' | 'expense';

  @ApiProperty({ example: 'Food' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Lunch with friends' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2026-05-23' })
  @IsDateString()
  date: string;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 100.50 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ enum: ['income', 'expense'] })
  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: 'income' | 'expense';

  @ApiPropertyOptional({ example: 'Food' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Lunch with friends' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-23' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class TransactionSummary {
  @ApiProperty({ example: 5000 })
  totalIncome: number;

  @ApiProperty({ example: 1500 })
  totalExpense: number;

  @ApiProperty({ example: 3500 })
  balance: number;
}
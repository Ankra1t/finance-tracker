import { IsString, IsNumber, IsIn, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Transaction {
  @ApiProperty({ example: '1' })
  id: string;

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
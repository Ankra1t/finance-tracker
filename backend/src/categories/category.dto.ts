import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from './category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '🍔' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
  @IsEnum(CategoryType)
  type: CategoryType;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Food' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '🍔' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ enum: CategoryType })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;
}
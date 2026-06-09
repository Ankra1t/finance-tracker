import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BudgetsService } from './budgets.service';
import { Budget } from './budget.entity';
import { CreateBudgetDto, UpdateBudgetDto, BudgetProgressDto } from './budget.dto';

@ApiTags('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all budgets for current user' })
  @ApiResponse({ status: 200, description: 'List of budgets', type: [Budget] })
  findAll(@Request() req: any): Promise<Budget[]> {
    return this.budgetsService.findAll(req.user.id);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get progress for all budgets' })
  @ApiResponse({ status: 200, description: 'Budget progress', type: [BudgetProgressDto] })
  getAllProgress(@Request() req: any): Promise<BudgetProgressDto[]> {
    return this.budgetsService.getAllProgress(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a budget by ID' })
  @ApiResponse({ status: 200, description: 'Budget details', type: Budget })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  findOne(@Param('id') id: string, @Request() req: any): Promise<Budget> {
    return this.budgetsService.findOne(id, req.user.id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get progress for a specific budget' })
  @ApiResponse({ status: 200, description: 'Budget progress', type: BudgetProgressDto })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  getProgress(@Param('id') id: string, @Request() req: any): Promise<BudgetProgressDto> {
    return this.budgetsService.getProgress(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created', type: Budget })
  create(@Body() createDto: CreateBudgetDto, @Request() req: any): Promise<Budget> {
    return this.budgetsService.create(req.user.id, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiResponse({ status: 200, description: 'Budget updated', type: Budget })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBudgetDto,
    @Request() req: any,
  ): Promise<Budget> {
    return this.budgetsService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiResponse({ status: 200, description: 'Budget deleted' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.budgetsService.delete(id, req.user.id);
  }
}
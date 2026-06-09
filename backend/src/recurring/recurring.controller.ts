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
import { RecurringService } from './recurring.service';
import { RecurringTransaction } from './recurring.entity';
import { CreateRecurringDto, UpdateRecurringDto } from './recurring.dto';

@ApiTags('recurring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  @ApiOperation({ summary: 'Get all recurring transactions for current user' })
  @ApiResponse({ status: 200, description: 'List of recurring transactions', type: [RecurringTransaction] })
  findAll(@Request() req: any): Promise<RecurringTransaction[]> {
    return this.recurringService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recurring transaction by ID' })
  @ApiResponse({ status: 200, description: 'Recurring transaction details', type: RecurringTransaction })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  findOne(@Param('id') id: string, @Request() req: any): Promise<RecurringTransaction> {
    return this.recurringService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new recurring transaction' })
  @ApiResponse({ status: 201, description: 'Recurring transaction created', type: RecurringTransaction })
  create(@Body() createDto: CreateRecurringDto, @Request() req: any): Promise<RecurringTransaction> {
    return this.recurringService.create(req.user.id, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a recurring transaction' })
  @ApiResponse({ status: 200, description: 'Recurring transaction updated', type: RecurringTransaction })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRecurringDto,
    @Request() req: any,
  ): Promise<RecurringTransaction> {
    return this.recurringService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recurring transaction' })
  @ApiResponse({ status: 200, description: 'Recurring transaction deleted' })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.recurringService.delete(id, req.user.id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause a recurring transaction' })
  @ApiResponse({ status: 200, description: 'Recurring transaction paused', type: RecurringTransaction })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  pause(@Param('id') id: string, @Request() req: any): Promise<RecurringTransaction> {
    return this.recurringService.pause(id, req.user.id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a recurring transaction' })
  @ApiResponse({ status: 200, description: 'Recurring transaction resumed', type: RecurringTransaction })
  @ApiResponse({ status: 404, description: 'Recurring transaction not found' })
  resume(@Param('id') id: string, @Request() req: any): Promise<RecurringTransaction> {
    return this.recurringService.resume(id, req.user.id);
  }

  @Post('process')
  @ApiOperation({ summary: 'Process all due recurring transactions' })
  @ApiResponse({ status: 200, description: 'Processing result' })
  process(): Promise<{ processed: number; created: number }> {
    return this.recurringService.processRecurring();
  }
}
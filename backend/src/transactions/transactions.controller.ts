import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFiltersDto,
} from './transaction.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions with filters and pagination' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async findAll(
    @Request() req: any,
    @Query() filters: TransactionFiltersDto,
  ): Promise<{ data: Transaction[]; total: number }> {
    return this.transactionsService.findAll(req.user.id, filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Transaction statistics' })
  async getStats(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.getStats(req.user.id, startDate, endDate);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export transactions to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file' })
  async exportToCsv(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const csv = await this.transactionsService.exportToCsv(req.user.id, startDate, endDate);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction details', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id') id: string, @Request() req: any): Promise<Transaction> {
    return this.transactionsService.findOne(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created', type: Transaction })
  create(
    @Body() createDto: CreateTransactionDto,
    @Request() req: any,
  ): Promise<Transaction> {
    return this.transactionsService.create(req.user.id, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionDto,
    @Request() req: any,
  ): Promise<Transaction> {
    return this.transactionsService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.transactionsService.delete(id, req.user.id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto, UpdateTransactionDto, TransactionSummary } from './transaction.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'List of all transactions', type: [Transaction] })
  findAll(): Transaction[] {
    return this.transactionsService.findAll();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary' })
  @ApiResponse({ status: 200, description: 'Summary of all transactions', type: TransactionSummary })
  getSummary() {
    return this.transactionsService.getSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction details', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id') id: string): Transaction {
    return this.transactionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created', type: Transaction })
  create(@Body() createDto: CreateTransactionDto): Transaction {
    return this.transactionsService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateTransactionDto): Transaction {
    return this.transactionsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  delete(@Param('id') id: string): { message: string } {
    this.transactionsService.delete(id);
    return { message: 'Transaction deleted successfully' };
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';

@Injectable()
export class TransactionsService {
  private transactions: Transaction[] = [
    {
      id: '1',
      amount: 5000,
      type: 'income',
      category: 'Salary',
      description: 'Monthly salary',
      date: '2026-05-01',
    },
    {
      id: '2',
      amount: 150,
      type: 'expense',
      category: 'Food',
      description: 'Grocery shopping',
      date: '2026-05-15',
    },
    {
      id: '3',
      amount: 50,
      type: 'expense',
      category: 'Transport',
      description: 'Gas',
      date: '2026-05-20',
    },
  ];
  private nextId = 4;

  findAll(): Transaction[] {
    return this.transactions;
  }

  findOne(id: string): Transaction {
    const transaction = this.transactions.find((t) => t.id === id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  create(createDto: CreateTransactionDto): Transaction {
    const transaction: Transaction = {
      id: String(this.nextId++),
      ...createDto,
    };
    this.transactions.push(transaction);
    return transaction;
  }

  update(id: string, updateDto: UpdateTransactionDto): Transaction {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    this.transactions[index] = { ...this.transactions[index], ...updateDto };
    return this.transactions[index];
  }

  delete(id: string): void {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    this.transactions.splice(index, 1);
  }

  getSummary() {
    const totalIncome = this.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = this.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}
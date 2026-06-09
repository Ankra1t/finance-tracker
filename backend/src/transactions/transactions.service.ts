import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, DataSource } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFiltersDto,
  TransactionStatsDto,
} from './transaction.dto';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly walletsService: WalletsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userId: string, filters: TransactionFiltersDto): Promise<{ data: Transaction[]; total: number }> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.wallet', 'wallet')
      .where('transaction.userId = :userId', { userId });

    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }
    if (filters.categoryId) {
      queryBuilder.andWhere('transaction.categoryId = :categoryId', { categoryId: filters.categoryId });
    }
    if (filters.walletId) {
      queryBuilder.andWhere('transaction.walletId = :walletId', { walletId: filters.walletId });
    }
    if (filters.startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('transaction.date', 'DESC').addOrderBy('transaction.createdAt', 'DESC');

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async create(userId: string, createDto: CreateTransactionDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = queryRunner.manager.create(Transaction, { ...createDto, userId });
      await queryRunner.manager.save(transaction);

      // Update wallet balance
      const isAddition = createDto.type === TransactionType.INCOME;
      await this.walletsService.updateBalance(createDto.walletId, createDto.amount, isAddition);

      await queryRunner.commitTransaction();
      return this.findOne(transaction.id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, userId: string, updateDto: UpdateTransactionDto): Promise<Transaction> {
    const existingTransaction = await this.findOne(id, userId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Reverse old balance change
      const wasAddition = existingTransaction.type === TransactionType.INCOME;
      await this.walletsService.updateBalance(
        existingTransaction.walletId,
        existingTransaction.amount,
        !wasAddition,
      );

      // Apply update
      Object.assign(existingTransaction, updateDto);
      await queryRunner.manager.save(existingTransaction);

      // Apply new balance change
      const isAddition = existingTransaction.type === TransactionType.INCOME;
      await this.walletsService.updateBalance(
        existingTransaction.walletId,
        existingTransaction.amount,
        isAddition,
      );

      await queryRunner.commitTransaction();
      return this.findOne(id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Reverse balance
      const isAddition = transaction.type === TransactionType.INCOME;
      await this.walletsService.updateBalance(transaction.walletId, transaction.amount, !isAddition);

      await queryRunner.manager.remove(transaction);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getStats(userId: string, startDate?: string, endDate?: string): Promise<TransactionStatsDto> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId });

    if (startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate });
    }

    const transactions = await queryBuilder.getMany();

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // By category
    const categoryMap = new Map<string, { name: string; amount: number; count: number }>();
    transactions.forEach((t) => {
      const catId = t.categoryId || 'uncategorized';
      const catName = t.category?.name || 'Uncategorized';
      const existing = categoryMap.get(catId) || { name: catName, amount: 0, count: 0 };
      categoryMap.set(catId, {
        name: catName,
        amount: existing.amount + Number(t.amount),
        count: existing.count + 1,
      });
    });

    // By month
    const monthMap = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      const month = t.date.substring(0, 7); // YYYY-MM
      const existing = monthMap.get(month) || { income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) {
        existing.income += Number(t.amount);
      } else {
        existing.expense += Number(t.amount);
      }
      monthMap.set(month, existing);
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      byCategory: Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        amount: data.amount,
        count: data.count,
      })),
      byMonth: Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ month, ...data })),
    };
  }

  async exportToCsv(userId: string, startDate?: string, endDate?: string): Promise<string> {
    const { data: transactions } = await this.findAll(userId, { startDate, endDate, limit: 10000 } as TransactionFiltersDto);

    const headers = ['Date', 'Type', 'Category', 'Wallet', 'Description', 'Amount'];
    const rows = transactions.map((t) => [
      t.date,
      t.type,
      t.category?.name || 'Uncategorized',
      t.wallet?.name || 'Unknown',
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
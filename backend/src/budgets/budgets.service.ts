import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Budget, BudgetPeriod } from './budget.entity';
import { CreateBudgetDto, UpdateBudgetDto, BudgetProgressDto } from './budget.dto';
import { Transaction, TransactionType } from '../transactions/transaction.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(userId: string): Promise<Budget[]> {
    return this.budgetRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({ where: { id, userId } });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    return budget;
  }

  async create(userId: string, createDto: CreateBudgetDto): Promise<Budget> {
    const budget = this.budgetRepository.create({ ...createDto, userId });
    return this.budgetRepository.save(budget);
  }

  async update(id: string, userId: string, updateDto: UpdateBudgetDto): Promise<Budget> {
    const budget = await this.findOne(id, userId);
    Object.assign(budget, updateDto);
    return this.budgetRepository.save(budget);
  }

  async delete(id: string, userId: string): Promise<void> {
    const budget = await this.findOne(id, userId);
    await this.budgetRepository.remove(budget);
  }

  async getProgress(id: string, userId: string): Promise<BudgetProgressDto> {
    const budget = await this.findOne(id, userId);

    // Calculate date range based on period
    const { startDate, endDate } = this.getDateRange(budget.period);

    // Get spending for this category in the current period
    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        categoryId: budget.categoryId,
        walletId: budget.walletId,
        type: TransactionType.EXPENSE as any,
        date: Between(startDate, endDate) as any,
      },
    });

    const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const remaining = Math.max(0, Number(budget.amount) - spent);
    const percentage = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0;

    return {
      budgetId: budget.id,
      budgetAmount: Number(budget.amount),
      spent,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
      isOverBudget: spent > Number(budget.amount),
      isNearLimit: percentage >= 80 && percentage <= 100,
    };
  }

  async getAllProgress(userId: string): Promise<BudgetProgressDto[]> {
    const budgets = await this.findAll(userId);
    const progress: BudgetProgressDto[] = [];

    for (const budget of budgets) {
      const { startDate, endDate } = this.getDateRange(budget.period);

      const transactions = await this.transactionRepository.find({
        where: {
          userId,
          categoryId: budget.categoryId,
          walletId: budget.walletId,
          type: TransactionType.EXPENSE as any,
          date: Between(startDate, endDate) as any,
        },
      });

      const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const remaining = Math.max(0, Number(budget.amount) - spent);
      const percentage = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0;

      progress.push({
        budgetId: budget.id,
        budgetAmount: Number(budget.amount),
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        isOverBudget: spent > Number(budget.amount),
        isNearLimit: percentage >= 80 && percentage <= 100,
      });
    }

    return progress;
  }

  private getDateRange(period: BudgetPeriod): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case BudgetPeriod.WEEKLY:
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case BudgetPeriod.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case BudgetPeriod.YEARLY:
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }
}
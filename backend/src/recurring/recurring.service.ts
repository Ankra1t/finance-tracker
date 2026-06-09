import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { RecurringTransaction, RecurringFrequency } from './recurring.entity';
import { CreateRecurringDto, UpdateRecurringDto } from './recurring.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/transaction.entity';

@Injectable()
export class RecurringService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private readonly recurringRepository: Repository<RecurringTransaction>,
    private readonly transactionsService: TransactionsService,
  ) {}

  async findAll(userId: string): Promise<RecurringTransaction[]> {
    return this.recurringRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<RecurringTransaction> {
    const recurring = await this.recurringRepository.findOne({
      where: { id, userId },
    });
    if (!recurring) {
      throw new NotFoundException(`Recurring transaction with ID ${id} not found`);
    }
    return recurring;
  }

  async create(userId: string, createDto: CreateRecurringDto): Promise<RecurringTransaction> {
    const recurring = this.recurringRepository.create({ ...createDto, userId });
    return this.recurringRepository.save(recurring);
  }

  async update(id: string, userId: string, updateDto: UpdateRecurringDto): Promise<RecurringTransaction> {
    const recurring = await this.findOne(id, userId);
    Object.assign(recurring, updateDto);
    return this.recurringRepository.save(recurring);
  }

  async delete(id: string, userId: string): Promise<void> {
    const recurring = await this.findOne(id, userId);
    await this.recurringRepository.remove(recurring);
  }

  async pause(id: string, userId: string): Promise<RecurringTransaction> {
    const recurring = await this.findOne(id, userId);
    recurring.isActive = false;
    return this.recurringRepository.save(recurring);
  }

  async resume(id: string, userId: string): Promise<RecurringTransaction> {
    const recurring = await this.findOne(id, userId);
    recurring.isActive = true;
    return this.recurringRepository.save(recurring);
  }

  async processRecurring(): Promise<{ processed: number; created: number }> {
    const today = new Date().toISOString().split('T')[0];

    // Find all active recurring transactions that should be processed
    const recurringTransactions = await this.recurringRepository.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(today),
      },
    });

    let processed = 0;
    let created = 0;

    for (const recurring of recurringTransactions) {
      // Check if end date has passed
      if (recurring.endDate && recurring.endDate < today) {
        recurring.isActive = false;
        await this.recurringRepository.save(recurring);
        continue;
      }

      // Check if it's time to process
      if (this.shouldProcess(recurring, today)) {
        // Determine transaction type based on amount sign or a type field
        // For simplicity, we'll assume expenses are negative, income positive
        const type = recurring.amount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;

        await this.transactionsService.create(recurring.userId, {
          amount: Math.abs(recurring.amount),
          type,
          description: recurring.description,
          date: today,
          categoryId: recurring.categoryId,
          walletId: recurring.walletId,
          recurringId: recurring.id,
        });

        recurring.lastProcessedAt = today;
        await this.recurringRepository.save(recurring);
        created++;
      }

      processed++;
    }

    return { processed, created };
  }

  private shouldProcess(recurring: RecurringTransaction, today: string): boolean {
    if (!recurring.lastProcessedAt) {
      return true;
    }

    const lastDate = new Date(recurring.lastProcessedAt);
    const todayDate = new Date(today);

    switch (recurring.frequency) {
      case RecurringFrequency.DAILY:
        // Already processed today
        return recurring.lastProcessedAt !== today;
      case RecurringFrequency.WEEKLY:
        const weekDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        return weekDiff >= 1;
      case RecurringFrequency.MONTHLY:
        return lastDate.getMonth() !== todayDate.getMonth() || lastDate.getFullYear() !== todayDate.getFullYear();
      case RecurringFrequency.YEARLY:
        return lastDate.getFullYear() !== todayDate.getFullYear();
      default:
        return false;
    }
  }
}
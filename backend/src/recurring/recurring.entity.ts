import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Category } from '../categories/category.entity';
import { Wallet } from '../wallets/wallet.entity';

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('recurring_transactions')
export class RecurringTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'simple-enum', enum: RecurringFrequency })
  frequency: RecurringFrequency;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastProcessedAt: string;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.recurringTransactions, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.recurringTransactions)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.recurringTransactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
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

export enum BudgetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'simple-enum', enum: BudgetPeriod })
  period: BudgetPeriod;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.budgets)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.budgets)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.budgets)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
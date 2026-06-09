import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Wallet } from '../wallets/wallet.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Category } from '../categories/category.entity';
import { Budget } from '../budgets/budget.entity';
import { RecurringTransaction } from '../recurring/recurring.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];

  @OneToMany(() => RecurringTransaction, (recurring) => recurring.user)
  recurringTransactions: RecurringTransaction[];
}
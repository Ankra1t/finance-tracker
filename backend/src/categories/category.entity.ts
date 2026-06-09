import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Budget } from '../budgets/budget.entity';
import { RecurringTransaction } from '../recurring/recurring.entity';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'simple-enum', enum: CategoryType })
  type: CategoryType;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.categories)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.category)
  budgets: Budget[];

  @OneToMany(() => RecurringTransaction, (recurring) => recurring.category)
  recurringTransactions: RecurringTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
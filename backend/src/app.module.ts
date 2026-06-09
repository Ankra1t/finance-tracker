import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { RecurringModule } from './recurring/recurring.module';
import { User } from './auth/user.entity';
import { Category } from './categories/category.entity';
import { Wallet } from './wallets/wallet.entity';
import { Transaction } from './transactions/transaction.entity';
import { Budget } from './budgets/budget.entity';
import { RecurringTransaction } from './recurring/recurring.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'finance.db',
      entities: [User, Category, Wallet, Transaction, Budget, RecurringTransaction],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    CategoriesModule,
    WalletsModule,
    TransactionsModule,
    BudgetsModule,
    RecurringModule,
  ],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    WalletsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
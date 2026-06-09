import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringController } from './recurring.controller';
import { RecurringService } from './recurring.service';
import { RecurringTransaction } from './recurring.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringTransaction]),
    TransactionsModule,
  ],
  controllers: [RecurringController],
  providers: [RecurringService],
  exports: [RecurringService],
})
export class RecurringModule {}
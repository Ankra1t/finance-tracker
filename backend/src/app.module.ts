import { Module } from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

@Module({
  imports: [TransactionsModule],
})
export class AppModule {}
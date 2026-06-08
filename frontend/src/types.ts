export type TransactionType = 'income' | 'expense';

export type Category = 'Food' | 'Transport' | 'Entertainment' | 'Salary' | 'Shopping' | 'Bills' | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CreateTransactionDto {
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  type?: TransactionType;
  category?: string;
  description?: string;
  date?: string;
}

export interface Filters {
  type?: TransactionType;
  category?: Category;
  startDate?: string;
  endDate?: string;
}
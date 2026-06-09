export type TransactionType = 'income' | 'expense';

export type Category = 'Food' | 'Transport' | 'Entertainment' | 'Salary' | 'Shopping' | 'Bills' | 'Other';

export type CategoryType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category?: Category;
  categoryId?: string;
  walletId?: string;
  wallet?: Wallet;
  description: string;
  date: string;
  createdAt?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CreateTransactionDto {
  amount: number;
  type: TransactionType;
  categoryId?: string;
  walletId: string;
  description: string;
  date: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  type?: TransactionType;
  categoryId?: string;
  walletId?: string;
  description?: string;
  date?: string;
}

export interface Filters {
  type?: TransactionType;
  categoryId?: string;
  walletId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: CategoryType;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
}

export interface Budget {
  id: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  categoryId: string;
  category?: Category;
  walletId: string;
  wallet?: Wallet;
}

export interface BudgetProgress {
  budgetId: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastProcessedAt?: string;
  categoryId?: string;
  category?: Category;
  walletId: string;
  wallet?: Wallet;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  byCategory: { categoryId: string; categoryName: string; amount: number; count: number }[];
  byMonth: { month: string; income: number; expense: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
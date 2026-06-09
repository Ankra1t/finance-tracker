import axios from 'axios';
import {
  AuthResponse,
  User,
  Category,
  Wallet,
  Transaction,
  TransactionStats,
  Budget,
  BudgetProgress,
  RecurringTransaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  PaginatedResponse,
  Filters,
} from './types';

const API_BASE = 'http://localhost:3001';

const getToken = () => localStorage.getItem('token');

const getHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', { email, password, name });
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};

// Categories
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await api.get('/categories');
    return res.data;
  },

  getOne: async (id: string): Promise<Category> => {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    const res = await api.post('/categories', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Wallets
export const walletsApi = {
  getAll: async (): Promise<Wallet[]> => {
    const res = await api.get('/wallets');
    return res.data;
  },

  getOne: async (id: string): Promise<Wallet> => {
    const res = await api.get(`/wallets/${id}`);
    return res.data;
  },

  create: async (data: Partial<Wallet>): Promise<Wallet> => {
    const res = await api.post('/wallets', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Wallet>): Promise<Wallet> => {
    const res = await api.put(`/wallets/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/wallets/${id}`);
  },

  transfer: async (fromWalletId: string, toWalletId: string, amount: number, description?: string): Promise<Wallet[]> => {
    const res = await api.post('/wallets/transfer', { fromWalletId, toWalletId, amount, description });
    return res.data;
  },
};

// Transactions
export const transactionsApi = {
  getAll: async (filters?: Filters): Promise<PaginatedResponse<Transaction>> => {
    const res = await api.get('/transactions', { params: filters });
    return res.data;
  },

  getOne: async (id: string): Promise<Transaction> => {
    const res = await api.get(`/transactions/${id}`);
    return res.data;
  },

  create: async (data: CreateTransactionDto): Promise<Transaction> => {
    const res = await api.post('/transactions', data);
    return res.data;
  },

  update: async (id: string, data: UpdateTransactionDto): Promise<Transaction> => {
    const res = await api.put(`/transactions/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  getStats: async (startDate?: string, endDate?: string): Promise<TransactionStats> => {
    const res = await api.get('/transactions/stats', { params: { startDate, endDate } });
    return res.data;
  },

  exportCsv: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const res = await api.get('/transactions/export', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return res.data;
  },
};

// Budgets
export const budgetsApi = {
  getAll: async (): Promise<Budget[]> => {
    const res = await api.get('/budgets');
    return res.data;
  },

  getOne: async (id: string): Promise<Budget> => {
    const res = await api.get(`/budgets/${id}`);
    return res.data;
  },

  create: async (data: Partial<Budget>): Promise<Budget> => {
    const res = await api.post('/budgets', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Budget>): Promise<Budget> => {
    const res = await api.put(`/budgets/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },

  getProgress: async (id: string): Promise<BudgetProgress> => {
    const res = await api.get(`/budgets/${id}/progress`);
    return res.data;
  },

  getAllProgress: async (): Promise<BudgetProgress[]> => {
    const res = await api.get('/budgets/progress');
    return res.data;
  },
};

// Recurring
export const recurringApi = {
  getAll: async (): Promise<RecurringTransaction[]> => {
    const res = await api.get('/recurring');
    return res.data;
  },

  getOne: async (id: string): Promise<RecurringTransaction> => {
    const res = await api.get(`/recurring/${id}`);
    return res.data;
  },

  create: async (data: Partial<RecurringTransaction>): Promise<RecurringTransaction> => {
    const res = await api.post('/recurring', data);
    return res.data;
  },

  update: async (id: string, data: Partial<RecurringTransaction>): Promise<RecurringTransaction> => {
    const res = await api.put(`/recurring/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/recurring/${id}`);
  },

  pause: async (id: string): Promise<RecurringTransaction> => {
    const res = await api.post(`/recurring/${id}/pause`);
    return res.data;
  },

  resume: async (id: string): Promise<RecurringTransaction> => {
    const res = await api.post(`/recurring/${id}/resume`);
    return res.data;
  },
};

export default api;
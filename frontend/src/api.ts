import { Transaction, TransactionSummary, CreateTransactionDto, UpdateTransactionDto } from './types';

const API_BASE = 'http://localhost:3001/transactions';

export const api = {
  async getAll(): Promise<Transaction[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getOne(id: string): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch transaction');
    return res.json();
  },

  async create(data: CreateTransactionDto): Promise<Transaction> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },

  async update(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete transaction');
  },

  async getSummary(): Promise<TransactionSummary> {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },
};
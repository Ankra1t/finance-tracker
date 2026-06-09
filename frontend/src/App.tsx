import { useState, useEffect } from 'react';
import { Transaction, TransactionSummary, CreateTransactionDto, Filters } from './types';
import { transactionsApi } from './api';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import './App.css';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [filters, setFilters] = useState<Filters>({});
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [txns, sum] = await Promise.all([
        transactionsApi.getAll(),
        transactionsApi.getStats(),
      ]);
      const data = {
        totalIncome: sum.income || 0,
        totalExpense: sum.expense || 0,
        balance: (sum.income || 0) - (sum.expense || 0),
      };
      setTransactions(txns.items || txns);
      setSummary(data);
    } catch (err) {
      setError('Failed to load data. Is the backend running on port 3001?');
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data: CreateTransactionDto) => {
    try {
      if (editingTransaction) {
        await transactionsApi.update(editingTransaction.id, data);
      } else {
        await transactionsApi.create(data);
      }
      setShowForm(false);
      setEditingTransaction(undefined);
      await loadData();
    } catch (err) {
      setError('Failed to save transaction');
      console.error('Failed to save:', err);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this transaction?')) {
      try {
        await transactionsApi.delete(id);
        await loadData();
      } catch (err) {
        setError('Failed to delete transaction');
        console.error('Failed to delete:', err);
      }
    }
  };

  return (
    <div className="app">
      <header>
        <h1>💰 Finance Tracker</h1>
        <button className="add-btn" onClick={() => { setEditingTransaction(undefined); setShowForm(true); }}>
          + Add Transaction
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <Dashboard summary={summary} />

      <TransactionList
        transactions={transactions}
        filters={filters}
        onFiltersChange={setFilters}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingTransaction(undefined); }}
        />
      )}
    </div>
  );
}
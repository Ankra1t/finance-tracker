import { Transaction, Filters, Category } from '../types';

const CATEGORIES: Category[] = ['Food', 'Transport', 'Entertainment', 'Salary', 'Shopping', 'Bills', 'Other'];

interface TransactionListProps {
  transactions: Transaction[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, filters, onFiltersChange, onEdit, onDelete }: TransactionListProps) {
  const filtered = transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.startDate && t.date < filters.startDate) return false;
    if (filters.endDate && t.date > filters.endDate) return false;
    return true;
  });

  return (
    <div className="transaction-list">
      <h2>💳 Transactions</h2>

      <div className="filters">
        <select
          value={filters.type || ''}
          onChange={(e) => onFiltersChange({ ...filters, type: (e.target.value as 'income' | 'expense') || undefined })}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.category || ''}
          onChange={(e) => onFiltersChange({ ...filters, category: (e.target.value as Category) || undefined })}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="date"
          placeholder="Start Date"
          value={filters.startDate || ''}
          onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined })}
        />

        <input
          type="date"
          placeholder="End Date"
          value={filters.endDate || ''}
          onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value || undefined })}
        />

        <button onClick={() => onFiltersChange({})}>Clear Filters</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="no-data">No transactions found</td>
            </tr>
          ) : (
            filtered.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>
                  <span className={`badge ${t.type}`}>{t.type}</span>
                </td>
                <td>{t.category}</td>
                <td>{t.description}</td>
                <td className={t.type === 'income' ? 'income-text' : 'expense-text'}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </td>
                <td>
                  <button className="edit-btn" onClick={() => onEdit(t)}>Edit</button>
                  <button className="delete-btn" onClick={() => onDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
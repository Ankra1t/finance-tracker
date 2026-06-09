import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, categoriesApi, walletsApi } from '../api';
import { Transaction, CreateTransactionDto, Filters } from '../types';
import { Plus, Search, Filter, Download, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionFormData {
  amount: string;
  type: 'income' | 'expense';
  categoryId: string;
  walletId: string;
  description: string;
  date: string;
}

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 20,
  });
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: '',
    type: 'expense',
    categoryId: '',
    walletId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: wallets } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionDto) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Transaction created');
      closeModal();
    },
    onError: () => toast.error('Failed to create transaction'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTransactionDto }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Transaction updated');
      closeModal();
    },
    onError: () => toast.error('Failed to update transaction'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Transaction deleted');
    },
    onError: () => toast.error('Failed to delete transaction'),
  });

  const openModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        amount: transaction.amount.toString(),
        type: transaction.type,
        categoryId: transaction.categoryId || '',
        walletId: transaction.walletId || '',
        description: transaction.description,
        date: transaction.date,
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        amount: '',
        type: 'expense',
        categoryId: categories?.[0]?.id || '',
        walletId: wallets?.[0]?.id || '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      categoryId: formData.categoryId || undefined,
      walletId: formData.walletId,
      description: formData.description,
      date: formData.date,
    };

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await transactionsApi.exportCsv(filters.startDate, filters.endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success('Export completed');
    } catch {
      toast.error('Failed to export');
    }
  };

  const filteredTransactions = data?.data.filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalPages = Math.ceil((data?.total || 0) / (filters.limit || 20));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined, page: 1 })}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filters.walletId || ''}
              onChange={(e) => setFilters({ ...filters, walletId: e.target.value || undefined, page: 1 })}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">All Wallets</option>
              {wallets?.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined, page: 1 })}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined, page: 1 })}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No transactions found. Create your first one!
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Wallet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {transaction.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {transaction.wallet?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {transaction.category?.name || '-'}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium text-right ${
                        transaction.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}$
                        {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openModal(transaction)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this transaction?')) {
                              deleteMutation.mutate(transaction.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to{' '}
                {Math.min((filters.page || 1) * (filters.limit || 20), data?.total || 0)} of {data?.total || 0}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={(filters.page || 1) <= 1}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={(filters.page || 1) >= totalPages}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold">
                {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Wallet
                </label>
                <select
                  value={formData.walletId}
                  onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select wallet</option>
                  {wallets?.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  {editingTransaction ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
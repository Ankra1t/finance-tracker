import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletsApi } from '../api';
import { Wallet } from '../types';
import { Plus, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

interface WalletFormData {
  name: string;
  currency: string;
  icon: string;
  color: string;
  balance: string;
}

interface TransferData {
  fromWalletId: string;
  toWalletId: string;
  amount: string;
  description: string;
}

export function WalletsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [formData, setFormData] = useState<WalletFormData>({
    name: '',
    currency: 'USD',
    icon: '💳',
    color: '#0ea5e9',
    balance: '0',
  });
  const [transferData, setTransferData] = useState<TransferData>({
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    description: '',
  });

  const { data: wallets, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => walletsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Wallet created');
      closeModal();
    },
    onError: () => toast.error('Failed to create wallet'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => walletsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Wallet updated');
      closeModal();
    },
    onError: () => toast.error('Failed to update wallet'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => walletsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Wallet deleted');
    },
    onError: () => toast.error('Failed to delete wallet'),
  });

  const transferMutation = useMutation({
    mutationFn: (data: any) => walletsApi.transfer(data.fromWalletId, data.toWalletId, parseFloat(data.amount), data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Transfer completed');
      setShowTransferModal(false);
    },
    onError: () => toast.error('Failed to transfer'),
  });

  const openModal = (wallet?: Wallet) => {
    if (wallet) {
      setEditingWallet(wallet);
      setFormData({
        name: wallet.name,
        currency: wallet.currency,
        icon: wallet.icon || '💳',
        color: wallet.color || '#0ea5e9',
        balance: wallet.balance.toString(),
      });
    } else {
      setEditingWallet(null);
      setFormData({
        name: '',
        currency: 'USD',
        icon: '💳',
        color: '#0ea5e9',
        balance: '0',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingWallet(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      balance: parseFloat(formData.balance),
    };

    if (editingWallet) {
      updateMutation.mutate({ id: editingWallet.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) || 0;

  const icons = ['💳', '🏦', '💵', '💰', '🎁', '🏠', '🚗', '✈️'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallets</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-2"
          >
            <ArrowRightLeft size={18} />
            Transfer
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Add Wallet
          </button>
        </div>
      </div>

      {/* Total Balance */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <p className="text-primary-100 mb-1">Total Balance</p>
        <p className="text-3xl font-bold">
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Wallets Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : wallets?.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No wallets yet. Create your first wallet!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets?.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: wallet.color + '20' }}
                  >
                    {wallet.icon || '💳'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{wallet.name}</h3>
                    <p className="text-sm text-slate-500">{wallet.currency}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(wallet)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 transition"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this wallet?')) {
                        deleteMutation.mutate(wallet.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Wallet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold">
                {editingWallet ? 'Edit Wallet' : 'New Wallet'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="RUB">RUB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Initial Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition ${
                        formData.icon === icon
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
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
                  {editingWallet ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold">Transfer Between Wallets</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                transferMutation.mutate(transferData);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  From Wallet
                </label>
                <select
                  value={transferData.fromWalletId}
                  onChange={(e) => setTransferData({ ...transferData, fromWalletId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select wallet</option>
                  {wallets?.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} (${w.balance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  To Wallet
                </label>
                <select
                  value={transferData.toWalletId}
                  onChange={(e) => setTransferData({ ...transferData, toWalletId: e.target.value })}
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
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={transferData.description}
                  onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import { useQuery } from '@tanstack/react-query';
import { transactionsApi, walletsApi, budgetsApi } from '../api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => transactionsApi.getStats(),
  });

  const { data: wallets, isLoading: walletsLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletsApi.getAll(),
  });

  const { data: budgetProgress, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgetProgress'],
    queryFn: () => budgetsApi.getAllProgress(),
  });

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) || 0;

  const nearLimitBudgets = budgetProgress?.filter((b) => b.isNearLimit) || [];
  const overBudgetCount = budgetProgress?.filter((b) => b.isOverBudget).length || 0;

  if (statsLoading || walletsLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Total Balance</span>
            <Wallet className="text-primary-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Total Income</span>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            +${stats?.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Total Expenses</span>
            <TrendingDown className="text-red-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            -${stats?.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Net Balance</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className={`text-2xl font-bold ${(stats?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${stats?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {(nearLimitBudgets.length > 0 || overBudgetCount > 0) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={24} />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Budget Alerts
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {overBudgetCount > 0 && `${overBudgetCount} budget(s) over limit. `}
                {nearLimitBudgets.length > 0 && `${nearLimitBudgets.length} budget(s) approaching limit.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses by Month */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Income vs Expenses
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.byMonth || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tickFormatter={(v) => {
                    const [year, month] = v.split('-');
                    return `${month}/${year.slice(2)}`;
                  }}
                />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Expenses by Category
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.byCategory.filter((c) => c.amount > 0) || []}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(stats?.byCategory || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Wallets Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Wallets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets?.map((wallet) => (
            <div
              key={wallet.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wallet.icon || '💳'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">{wallet.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{wallet.currency}</p>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">
                  ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
          {(!wallets || wallets.length === 0) && (
            <p className="text-slate-500 dark:text-slate-400 col-span-full text-center py-8">
              No wallets yet. Create one to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
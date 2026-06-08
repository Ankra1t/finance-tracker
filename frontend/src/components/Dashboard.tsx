import { TransactionSummary as SummaryType } from '../types';

interface DashboardProps {
  summary: SummaryType;
}

export function Dashboard({ summary }: DashboardProps) {
  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
      <div className="dashboard-cards">
        <div className="card income">
          <span className="label">Total Income</span>
          <span className="value">${summary.totalIncome.toFixed(2)}</span>
        </div>
        <div className="card expense">
          <span className="label">Total Expenses</span>
          <span className="value">${summary.totalExpense.toFixed(2)}</span>
        </div>
        <div className="card balance">
          <span className="label">Balance</span>
          <span className="value">${summary.balance.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
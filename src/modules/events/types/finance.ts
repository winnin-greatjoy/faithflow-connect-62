export type TransactionMethod = 'card' | 'cash' | 'transfer' | 'mobile_money';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  donorName: string; // 'Anonymous' if hidden
  amount: number;
  currency: string;
  method: TransactionMethod;
  campaign: string; // e.g. "Tithes", "Building Fund"
  timestamp: string;
  status: TransactionStatus;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'on_track' | 'over_budget' | 'warning';
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netPosition: number;
  recentTransactions: Transaction[];
}

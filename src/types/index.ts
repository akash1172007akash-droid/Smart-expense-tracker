export type TransactionType = "INCOME" | "EXPENSE";

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";

export type BudgetPeriod = "MONTHLY" | "WEEKLY";

export interface CategoryItem {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TransactionItem {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string | Date;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: CategoryItem;
}

export interface BudgetItem {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  month: number;
  year: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: CategoryItem;
}

export type BudgetStatus = "NORMAL" | "WARNING" | "OVER_BUDGET";

export interface BudgetProgress {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
  period: BudgetPeriod;
  month: number;
  year: number;
}

export interface FinancialKPISummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage (0 - 100)
  dailyAverageSpend: number;
  transactionCount: number;
}

export interface CashFlowPoint {
  date: string; // "Jan 2026", "2026-09-01", etc.
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdownPoint {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface SpendingTrajectoryPoint {
  day: number;
  dateStr: string;
  actualCumulativeSpend: number;
  budgetCap: number;
  linearPaceTarget: number;
}

export interface AnalyticsResponse {
  summary: FinancialKPISummary;
  cashFlow: CashFlowPoint[];
  categoryBreakdown: CategoryBreakdownPoint[];
  trajectory: SpendingTrajectoryPoint[];
  budgetHealth: BudgetProgress[];
}

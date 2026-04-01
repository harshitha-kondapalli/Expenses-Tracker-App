import type { ExpenseCategory } from "../constants/categories";
import type { PaymentMethod } from "../constants/payment-methods";
import type { Expense, Transaction } from "./transaction";

export interface ExpenseSummary {
  totalSpent: number;
  monthlySpent: number;
  recentExpenses: Expense[];
  categoryTotals: Record<ExpenseCategory, number>;
}

export interface SpendingTrendPoint {
  label: string;
  total: number;
  category?: ExpenseCategory;
}

export interface DashboardSummary {
  totalSpent: number;
  monthlySpent: number;
  transactionCount: number;
  categoryTotals: Record<ExpenseCategory, number>;
  paymentMethodTotals: Record<PaymentMethod, number>;
  dailyTrend: SpendingTrendPoint[];
  monthlyTrend: SpendingTrendPoint[];
  recentTransactions: Transaction[];
}

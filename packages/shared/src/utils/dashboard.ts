import { expenseCategories, type ExpenseCategory } from "../constants/categories";
import {
  paymentMethods,
  type PaymentMethod
} from "../constants/payment-methods";
import { getDayKey, getMonthKey } from "./date";
import type { DashboardSummary, SpendingTrendPoint } from "../types/dashboard";
import type { Transaction } from "../types/transaction";

const buildCategoryTotals = () =>
  expenseCategories.reduce(
    (accumulator, category) => ({
      ...accumulator,
      [category]: 0
    }),
    {} as Record<ExpenseCategory, number>
  );

const buildPaymentMethodTotals = () =>
  paymentMethods.reduce(
    (accumulator, method) => ({
      ...accumulator,
      [method]: 0
    }),
    {} as Record<PaymentMethod, number>
  );

const mapTrend = (totals: Record<string, number>): SpendingTrendPoint[] =>
  Object.entries(totals)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, total]) => ({ label, total }));

export const buildDashboardSummary = (
  transactions: Transaction[],
  today = new Date()
): DashboardSummary => {
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const categoryTotals = buildCategoryTotals();
  const paymentMethodTotals = buildPaymentMethodTotals();
  const dailyTotals: Record<string, number> = {};
  const monthlyTotals: Record<string, number> = {};

  let totalSpent = 0;
  let monthlySpent = 0;

  for (const transaction of transactions) {
    if (transaction.direction !== "debit" || transaction.status !== "completed") {
      continue;
    }

    totalSpent += transaction.amount;
    categoryTotals[transaction.category] += transaction.amount;
    paymentMethodTotals[transaction.paymentMethod] += transaction.amount;

    const valueDate = new Date(transaction.date);
    if (valueDate.getMonth() === currentMonth && valueDate.getFullYear() === currentYear) {
      monthlySpent += transaction.amount;
    }

    const dayKey = getDayKey(transaction.date);
    const monthKey = getMonthKey(transaction.date);
    dailyTotals[dayKey] = (dailyTotals[dayKey] ?? 0) + transaction.amount;
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] ?? 0) + transaction.amount;
  }

  return {
    totalSpent,
    monthlySpent,
    transactionCount: transactions.length,
    categoryTotals,
    paymentMethodTotals,
    dailyTrend: mapTrend(dailyTotals),
    monthlyTrend: mapTrend(monthlyTotals),
    recentTransactions: [...transactions]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 10)
  };
};

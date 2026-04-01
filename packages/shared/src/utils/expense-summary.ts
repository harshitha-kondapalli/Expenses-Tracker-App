import { expenseCategories, type ExpenseCategory } from "../constants/categories";
import type { Expense } from "../types/transaction";
import type { ExpenseSummary } from "../types/dashboard";

export const buildExpenseSummary = (expenses: Expense[], today = new Date()): ExpenseSummary => {
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const categoryTotals = expenseCategories.reduce(
    (accumulator, category) => ({
      ...accumulator,
      [category]: 0
    }),
    {} as Record<ExpenseCategory, number>
  );

  let totalSpent = 0;
  let monthlySpent = 0;

  for (const expense of expenses) {
    totalSpent += expense.amount;
    categoryTotals[expense.category] += expense.amount;

    const expenseDate = new Date(expense.date);
    if (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    ) {
      monthlySpent += expense.amount;
    }
  }

  const recentExpenses = [...expenses]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5);

  return {
    totalSpent,
    monthlySpent,
    recentExpenses,
    categoryTotals
  };
};

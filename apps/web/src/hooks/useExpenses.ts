import { useEffect, useState } from "react";
import { buildExpenseSummary, sampleExpenses, type Expense } from "@expenses/shared";
import { loadExpenses, saveExpenses } from "../utils/storage";

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const persistedExpenses = loadExpenses();
    return persistedExpenses.length > 0 ? persistedExpenses : sampleExpenses;
  });

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const summary = buildExpenseSummary(expenses);

  const addExpense = (expense: Omit<Expense, "id">) => {
    setExpenses((currentExpenses) => [
      {
        ...expense,
        id: crypto.randomUUID()
      },
      ...currentExpenses
    ]);
  };

  return {
    expenses,
    summary,
    addExpense
  };
};

import { useEffect, useState } from "react";
import { buildExpenseSummary, sampleExpenses, type Expense } from "@expenses/shared";
import { loadExpenses, saveExpenses } from "../utils/storage";

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrateExpenses = async () => {
      const storedExpenses = await loadExpenses();
      if (storedExpenses.length > 0) {
        setExpenses(storedExpenses);
      }
      setIsHydrated(true);
    };

    void hydrateExpenses();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void saveExpenses(expenses);
  }, [expenses, isHydrated]);

  const summary = buildExpenseSummary(expenses);

  const addExpense = (expense: Omit<Expense, "id">) => {
    setExpenses((currentExpenses) => [
      {
        ...expense,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`
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

import type { Expense } from "@expenses/shared";

const STORAGE_KEY = "expenses-tracker-web";

export const loadExpenses = (): Expense[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as Expense[];
  } catch {
    return [];
  }
};

export const saveExpenses = (expenses: Expense[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

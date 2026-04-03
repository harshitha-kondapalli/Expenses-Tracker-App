import type { Transaction } from "@expenses/shared";

const STORAGE_KEY = "expenses-tracker-web-transactions";

export const loadTransactions = (): Transaction[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as Transaction[];
  } catch {
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

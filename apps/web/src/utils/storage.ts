import type { Transaction } from "@expenses/shared";

const buildStorageKey = (userId?: string) =>
  `expenses-tracker-web-transactions${userId ? `:${userId}` : ""}`;

export const loadTransactions = (userId?: string): Transaction[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const value = window.localStorage.getItem(buildStorageKey(userId));
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as Transaction[];
  } catch {
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[], userId?: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildStorageKey(userId), JSON.stringify(transactions));
};

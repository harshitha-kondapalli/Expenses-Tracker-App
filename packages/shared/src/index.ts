export * from "./constants/categories";
export * from "./constants/payment-methods";
export * from "./types/transaction";
export * from "./types/dashboard";
export * from "./types/import-job";
export * from "./types/category-rule";
export * from "./utils/currency";
export * from "./utils/date";
export * from "./utils/normalize";
export * from "./utils/expense-summary";
export * from "./utils/dashboard";

import type { Expense } from "./types/transaction";

export const sampleExpenses: Expense[] = [
  {
    id: "exp-1",
    title: "Groceries",
    amount: 54.25,
    category: "Groceries",
    date: "2026-03-29",
    note: "Weekly essentials"
  },
  {
    id: "exp-2",
    title: "Bus pass",
    amount: 18,
    category: "Transport",
    date: "2026-03-27"
  },
  {
    id: "exp-3",
    title: "Internet bill",
    amount: 42.99,
    category: "Bills",
    date: "2026-03-20"
  }
];

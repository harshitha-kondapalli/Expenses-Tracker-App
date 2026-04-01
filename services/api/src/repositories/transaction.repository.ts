import type { Transaction } from "@expenses/shared";

const now = new Date().toISOString();

const transactions: Transaction[] = [
  {
    id: "txn-1",
    date: "2026-03-29T09:15:00.000Z",
    amount: 320,
    currency: "INR",
    direction: "debit",
    status: "completed",
    merchant: "Swiggy",
    merchantNormalized: "swiggy",
    description: "UPI payment to Swiggy",
    paymentMethod: "UPI",
    source: "manual",
    category: "Food",
    isAutoCategorized: true,
    categoryConfidence: 0.94,
    rawMessage: "Paid Rs 320 to Swiggy via UPI",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "txn-2",
    date: "2026-03-27T12:30:00.000Z",
    amount: 1499,
    currency: "INR",
    direction: "debit",
    status: "completed",
    merchant: "Amazon",
    merchantNormalized: "amazon",
    description: "Card payment at Amazon",
    paymentMethod: "Card",
    source: "manual",
    accountLast4: "4242",
    cardNetwork: "Visa",
    category: "Shopping",
    isAutoCategorized: true,
    categoryConfidence: 0.9,
    rawMessage: "Card charged for Amazon order",
    createdAt: now,
    updatedAt: now
  }
];

export const transactionRepository = {
  list: () => transactions,
  add: (transaction: Transaction) => {
    transactions.unshift(transaction);
    return transaction;
  }
};

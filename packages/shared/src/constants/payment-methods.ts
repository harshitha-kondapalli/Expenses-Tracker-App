export const paymentMethods = [
  "UPI",
  "Card",
  "NetBanking",
  "Wallet",
  "Cash",
  "Other"
] as const;

export const transactionSources = [
  "sms",
  "email",
  "statement_upload",
  "manual",
  "agent"
] as const;

export const transactionDirections = ["debit", "credit"] as const;

export const transactionStatuses = [
  "pending",
  "completed",
  "failed",
  "reversed"
] as const;

export const supportedCurrencies = ["INR"] as const;

export const cardNetworks = ["Visa", "Mastercard", "RuPay", "Amex", "Other"] as const;

export type PaymentMethod = (typeof paymentMethods)[number];
export type TransactionSource = (typeof transactionSources)[number];
export type TransactionDirection = (typeof transactionDirections)[number];
export type TransactionStatus = (typeof transactionStatuses)[number];
export type SupportedCurrency = (typeof supportedCurrencies)[number];
export type CardNetwork = (typeof cardNetworks)[number];

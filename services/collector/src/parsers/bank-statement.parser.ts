import type { Transaction } from "@expenses/shared";

export const parseStatementRow = (row: Record<string, string>): Partial<Transaction> => ({
  externalId: row.reference,
  date: row.date,
  description: row.description ?? "Statement transaction",
  merchant: row.merchant,
  amount: Number(row.amount ?? 0)
});

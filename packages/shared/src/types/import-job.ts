import type { TransactionSource } from "../constants/payment-methods";

export interface ImportJob {
  id: string;
  source: TransactionSource;
  status: "queued" | "running" | "completed" | "failed";
  totalRecords: number;
  importedRecords: number;
  duplicateRecords: number;
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
}

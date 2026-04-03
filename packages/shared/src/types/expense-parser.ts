import type { ExpenseCategory } from "../constants/categories";
import type { PaymentMethod } from "../constants/payment-methods";
import type { Transaction } from "./transaction";

export interface ExpenseParserHistoryEntry
  extends Pick<
    Transaction,
    "merchant" | "merchantNormalized" | "description" | "note" | "category" | "paymentMethod"
  > {}

export interface ParseExpenseInputOptions {
  existingTransactions?: ExpenseParserHistoryEntry[];
  defaultPaymentMethod?: PaymentMethod;
}

export interface ParsedExpenseInput {
  rawInput: string;
  amount: number | null;
  merchant: string;
  note: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  categoryConfidence: number;
  isAutoCategorized: boolean;
  matchedKeyword?: string;
  matchedHistoryMerchant?: string;
}

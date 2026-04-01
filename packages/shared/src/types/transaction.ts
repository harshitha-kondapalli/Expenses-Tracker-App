import type {
  CardNetwork,
  PaymentMethod,
  SupportedCurrency,
  TransactionDirection,
  TransactionSource,
  TransactionStatus
} from "../constants/payment-methods";
import type { ExpenseCategory } from "../constants/categories";

export interface Transaction {
  id: string;
  externalId?: string;
  date: string;
  amount: number;
  currency: SupportedCurrency;
  direction: TransactionDirection;
  status: TransactionStatus;
  merchant?: string;
  merchantNormalized?: string;
  description: string;
  note?: string;
  paymentMethod: PaymentMethod;
  source: TransactionSource;
  sourceRef?: string;
  accountLast4?: string;
  upiHandle?: string;
  cardNetwork?: CardNetwork;
  category: ExpenseCategory;
  categoryConfidence?: number;
  isAutoCategorized: boolean;
  tags?: string[];
  rawMessage?: string;
  rawPayload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
}

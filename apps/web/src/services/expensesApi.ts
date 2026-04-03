import {
  expenseCategories,
  normalizeMerchant,
  paymentMethods,
  parseExpenseInput,
  type ExpenseCategory,
  type PaymentMethod,
  type ParsedExpenseInput,
  type Transaction
} from "@expenses/shared";
import { ApiError, requestJson } from "./api";

export type CreateExpensePayload = Pick<
  Transaction,
  "merchant" | "amount" | "category" | "paymentMethod" | "date" | "note"
> & {
  description?: string;
  categoryConfidence?: number;
  isAutoCategorized?: boolean;
  rawMessage?: string;
  tags?: string[];
  recoveryReminder?: {
    dueDate: string;
    reminderDays: number;
  };
};

export type UpdateExpensePayload = {
  merchant: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  date: string;
  note?: string;
};

interface BackendParseExpenseResponse {
  amount?: number | null;
  category?: string;
  note?: string;
  title?: string;
  confidence?: number;
  strategy?: string;
}

interface BackendExpense {
  id: number | string;
  amount: number;
  category: string;
  note?: string | null;
  title?: string | null;
  payment_method?: string | null;
  expense_at?: string | null;
  created_at?: string | null;
}

interface BackendExpenseUpdateRequest {
  amount: number;
  category: string;
  note: string;
  title: string;
  expense_at: string;
  payment_method?: string;
}

interface BackendExpenseCreateRequest {
  amount: number;
  category: string;
  note: string;
  title: string;
  expense_at: string;
  payment_method?: string;
}

const isFrontendTransaction = (value: unknown): value is Transaction =>
  Boolean(
    value &&
      typeof value === "object" &&
      "date" in value &&
      "paymentMethod" in value &&
      "direction" in value &&
      "status" in value
  );

const normalizeCategory = (category?: string | null): ExpenseCategory => {
  if (!category) {
    return "Other";
  }

  const normalized = category.trim().toLowerCase();
  if (normalized === "others") {
    return "Other";
  }

  const match = expenseCategories.find((candidate) => candidate.toLowerCase() === normalized);
  return match ?? "Other";
};

const normalizePaymentMethod = (paymentMethod?: string | null): PaymentMethod => {
  if (!paymentMethod) {
    return "Other";
  }

  const normalized = paymentMethod.trim().toLowerCase();
  if (normalized === "upi") {
    return "UPI";
  }
  if (normalized === "card" || normalized === "credit_card" || normalized === "debit_card") {
    return "Card";
  }
  if (normalized === "netbanking" || normalized === "net_banking" || normalized === "bank_transfer") {
    return "NetBanking";
  }
  if (normalized === "wallet") {
    return "Wallet";
  }
  if (normalized === "cash") {
    return "Cash";
  }

  const match = paymentMethods.find((candidate) => candidate.toLowerCase() === normalized);
  return match ?? "Other";
};

const adaptBackendParseResponse = (
  input: string,
  response: BackendParseExpenseResponse,
  defaultPaymentMethod: Transaction["paymentMethod"]
): ParsedExpenseInput => {
  const merchant = response.title?.trim() || response.note?.trim() || "Manual Entry";
  const note = response.note?.trim() || "";
  const categoryConfidence = response.confidence ?? 0.45;

  return {
    rawInput: input,
    amount: response.amount ?? null,
    merchant,
    note,
    category: normalizeCategory(response.category),
    paymentMethod: defaultPaymentMethod,
    categoryConfidence,
    isAutoCategorized: categoryConfidence >= 0.7,
    matchedKeyword: response.strategy,
    matchedHistoryMerchant: undefined
  };
};

const adaptBackendExpense = (expense: BackendExpense): Transaction => {
  const merchant = expense.title?.trim() || expense.note?.trim() || "Manual Entry";
  const note = expense.note?.trim() || undefined;
  const date = expense.expense_at || expense.created_at || new Date().toISOString();
  const createdAt = expense.created_at || date;

  return {
    id: String(expense.id),
    date,
    amount: expense.amount,
    currency: "INR",
    direction: "debit",
    status: "completed",
    merchant,
    merchantNormalized: normalizeMerchant(merchant),
    description: note || merchant,
    note,
    paymentMethod: normalizePaymentMethod(expense.payment_method),
    source: "manual",
    category: normalizeCategory(expense.category),
    categoryConfidence: undefined,
    isAutoCategorized: false,
    tags: ["manual-entry"],
    rawMessage: undefined,
    createdAt,
    updatedAt: createdAt
  };
};

export const parseExpenseWithApi = async (
  input: string,
  transactions: Transaction[],
  defaultPaymentMethod: Transaction["paymentMethod"]
): Promise<ParsedExpenseInput> => {
  try {
    const response = await requestJson<ParsedExpenseInput | BackendParseExpenseResponse>("/parse-expense", {
      method: "POST",
      body: JSON.stringify({ input })
    });

    if ("rawInput" in response && "paymentMethod" in response) {
      return response;
    }

    return adaptBackendParseResponse(input, response, defaultPaymentMethod);
  } catch (error) {
    if (error instanceof ApiError || error instanceof TypeError) {
      return parseExpenseInput(input, {
        existingTransactions: transactions,
        defaultPaymentMethod
      });
    }

    throw error;
  }
};

export const fetchExpenses = async (): Promise<Transaction[]> => {
  const response = await requestJson<Transaction[] | BackendExpense[]>("/expenses");
  return response.map((expense) => (isFrontendTransaction(expense) ? expense : adaptBackendExpense(expense)));
};

export const createExpense = async (payload: CreateExpensePayload): Promise<Transaction> => {
  const backendPayload: BackendExpenseCreateRequest = {
    amount: payload.amount,
    category: payload.category,
    note: payload.note ?? "",
    title: payload.merchant ?? "",
    expense_at: new Date(`${payload.date}T12:00:00.000Z`).toISOString(),
    payment_method: payload.paymentMethod.toLowerCase()
  };

  const response = await requestJson<Transaction | BackendExpense>("/expenses", {
    method: "POST",
    body: JSON.stringify(backendPayload)
  });

  return isFrontendTransaction(response) ? response : adaptBackendExpense(response);
};

export const updateExpenseById = async (
  transactionId: string,
  payload: UpdateExpensePayload
): Promise<Transaction> => {
  const backendPayload: BackendExpenseUpdateRequest = {
    amount: payload.amount,
    category: payload.category,
    note: payload.note ?? "",
    title: payload.merchant,
    expense_at: new Date(`${payload.date}T12:00:00.000Z`).toISOString(),
    payment_method: payload.paymentMethod.toLowerCase()
  };

  const response = await requestJson<Transaction | BackendExpense>(`/expenses/${transactionId}`, {
    method: "PUT",
    body: JSON.stringify(backendPayload)
  });

  return isFrontendTransaction(response) ? response : adaptBackendExpense(response);
};

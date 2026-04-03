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
import { ApiError, requestJson, requestVoid } from "./api";

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

interface BackendReceivable {
  id: number | string;
  expense_id?: number | string | null;
  title: string;
  amount: number;
  note?: string | null;
  remind_at: string;
  status: string;
  received_transaction_id?: number | string | null;
  received_at?: string | null;
  created_at: string;
  updated_at: string;
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

interface BackendReceivableCreateRequest {
  amount: number;
  title: string;
  note: string;
  remind_at: string;
  expense_id?: number;
}

interface BackendReceivableReceiveRequest {
  payment_method?: string;
  received_at?: string;
  note?: string;
}

export interface ReceivableReminderRecord {
  id: string;
  expenseId?: string;
  title: string;
  amount: number;
  note?: string;
  remindAt: string;
  status: "open" | "collected";
  receivedTransactionId?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
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

const adaptBackendExpense = (
  expense: BackendExpense,
  direction: Transaction["direction"] = "debit"
): Transaction => {
  const merchant = expense.title?.trim() || expense.note?.trim() || "Manual Entry";
  const note = expense.note?.trim() || undefined;
  const date = expense.expense_at || expense.created_at || new Date().toISOString();
  const createdAt = expense.created_at || date;

  return {
    id: String(expense.id),
    date,
    amount: expense.amount,
    currency: "INR",
    direction,
    status: "completed",
    merchant,
    merchantNormalized: normalizeMerchant(merchant),
    description: note || `${direction === "credit" ? "Credit from" : "Payment to"} ${merchant}`,
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

const adaptBackendReceivable = (reminder: BackendReceivable): ReceivableReminderRecord => ({
  id: String(reminder.id),
  expenseId: reminder.expense_id ? String(reminder.expense_id) : undefined,
  title: reminder.title,
  amount: reminder.amount,
  note: reminder.note?.trim() || undefined,
  remindAt: reminder.remind_at,
  status: reminder.status === "collected" ? "collected" : "open",
  receivedTransactionId: reminder.received_transaction_id
    ? String(reminder.received_transaction_id)
    : undefined,
  receivedAt: reminder.received_at || undefined,
  createdAt: reminder.created_at,
  updatedAt: reminder.updated_at
});

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
  return response.map((expense) =>
    isFrontendTransaction(expense) ? expense : adaptBackendExpense(expense, "debit")
  );
};

export const fetchCredits = async (): Promise<Transaction[]> => {
  const response = await requestJson<Transaction[] | BackendExpense[]>("/credits");
  return response.map((expense) =>
    isFrontendTransaction(expense) ? expense : adaptBackendExpense(expense, "credit")
  );
};

export const fetchReceivables = async (): Promise<ReceivableReminderRecord[]> => {
  const response = await requestJson<BackendReceivable[]>("/receivables?status=open&limit=100");
  return response.map(adaptBackendReceivable);
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

  return isFrontendTransaction(response) ? response : adaptBackendExpense(response, "debit");
};

export const createCredit = async (payload: UpdateExpensePayload): Promise<Transaction> => {
  const backendPayload: BackendExpenseCreateRequest = {
    amount: payload.amount,
    category: payload.category,
    note: payload.note ?? "",
    title: payload.merchant,
    expense_at: new Date(`${payload.date}T12:00:00.000Z`).toISOString(),
    payment_method: payload.paymentMethod.toLowerCase()
  };

  const response = await requestJson<Transaction | BackendExpense>("/expenses", {
    method: "POST",
    body: JSON.stringify(backendPayload)
  });

  return isFrontendTransaction(response) ? response : adaptBackendExpense(response, "credit");
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

  const direction = payload.category === "Salary" || payload.category === "Transfer" ? "credit" : "debit";
  return isFrontendTransaction(response) ? response : adaptBackendExpense(response, direction);
};

export const deleteExpenseById = async (transactionId: string): Promise<void> => {
  await requestVoid(`/expenses/${transactionId}`, {
    method: "DELETE"
  });
};

export const deleteTransactionById = async (transactionId: string): Promise<void> => {
  await requestVoid(`/transactions/${transactionId}`, {
    method: "DELETE"
  });
};

export const createReceivable = async (payload: {
  amount: number;
  title: string;
  note?: string;
  remindAt: string;
  expenseId?: string;
}): Promise<ReceivableReminderRecord> => {
  const backendPayload: BackendReceivableCreateRequest = {
    amount: payload.amount,
    title: payload.title,
    note: payload.note ?? "",
    remind_at: payload.remindAt,
    expense_id: payload.expenseId ? Number(payload.expenseId) : undefined
  };

  const response = await requestJson<BackendReceivable>("/receivables", {
    method: "POST",
    body: JSON.stringify(backendPayload)
  });

  return adaptBackendReceivable(response);
};

export const markReceivableReceived = async (payload: {
  reminderId: string;
  paymentMethod: PaymentMethod;
  receivedAt?: string;
  note?: string;
}): Promise<ReceivableReminderRecord> => {
  const backendPayload: BackendReceivableReceiveRequest = {
    payment_method: payload.paymentMethod.toLowerCase(),
    received_at: payload.receivedAt,
    note: payload.note ?? ""
  };

  const response = await requestJson<BackendReceivable>(
    `/receivables/${payload.reminderId}/receive`,
    {
      method: "PATCH",
      body: JSON.stringify(backendPayload)
    }
  );

  return adaptBackendReceivable(response);
};

import { useEffect, useState } from "react";
import {
  buildDashboardSummary,
  formatCurrency,
  normalizeMerchant,
  type ImportJob,
  type ExpenseCategory,
  type PaymentMethod,
  type Transaction
} from "@expenses/shared";
import { mockImportJobs, mockTransactions } from "../services/mockData";
import {
  createExpense,
  fetchExpenses,
  updateExpenseById,
  type CreateExpensePayload,
  type UpdateExpensePayload
} from "../services/expensesApi";
import { loadTransactions, saveTransactions } from "../utils/storage";
import type { DashboardFilters } from "../components/FiltersBar";

const defaultFilters: DashboardFilters = {
  query: "",
  category: "all",
  paymentMethod: "all",
  dateWindow: "30d"
};

const matchesDateWindow = (transaction: Transaction, dateWindow: DashboardFilters["dateWindow"]) => {
  if (dateWindow === "all") {
    return true;
  }

  const days = {
    "7d": 7,
    "30d": 30,
    "90d": 90
  }[dateWindow];

  const today = new Date("2026-04-01T12:00:00.000Z");
  const start = new Date(today);
  start.setDate(today.getDate() - days);

  return new Date(transaction.date) >= start;
};

export const useExpenses = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const persistedTransactions = loadTransactions();
    return persistedTransactions.length > 0 ? persistedTransactions : mockTransactions;
  });
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [importJobs] = useState<ImportJob[]>(mockImportJobs);
  const [apiStatus, setApiStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    let cancelled = false;

    const syncTransactions = async () => {
      try {
        const remoteTransactions = await fetchExpenses();
        if (cancelled) {
          return;
        }

        setTransactions((currentTransactions) => {
          const localTransactionMap = new Map(currentTransactions.map((transaction) => [transaction.id, transaction]));

          return [
            ...currentTransactions.filter((transaction) => transaction.direction === "credit"),
            ...remoteTransactions.map((transaction) => {
              const localTransaction = localTransactionMap.get(transaction.id);

              return localTransaction?.recoveryReminder
                ? { ...transaction, recoveryReminder: localTransaction.recoveryReminder }
                : transaction;
            })
          ];
        });
        setApiStatus("online");
        setApiMessage("Connected to FastAPI backend");
      } catch {
        if (cancelled) {
          return;
        }

        setApiStatus("offline");
        setApiMessage("Backend unavailable, using local demo data");
      }
    };

    void syncTransactions();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const merchantText = `${transaction.merchant ?? ""} ${transaction.description} ${transaction.note ?? ""}`.toLowerCase();
    const amountText = [
      String(transaction.amount),
      transaction.amount.toFixed(2),
      formatCurrency(transaction.amount, "INR", "en-IN"),
      formatCurrency(transaction.amount, "INR", "en-IN").replace(/[^\d.]/g, "")
    ]
      .join(" ")
      .toLowerCase();
    const categoryMatches = filters.category === "all" || transaction.category === filters.category;
    const paymentMatches =
      filters.paymentMethod === "all" || transaction.paymentMethod === filters.paymentMethod;
    const queryMatches =
      normalizedQuery.length === 0 ||
      merchantText.includes(normalizedQuery) ||
      amountText.includes(normalizedQuery) ||
      normalizeMerchant(transaction.merchant).includes(normalizedQuery);
    const dateMatches = matchesDateWindow(transaction, filters.dateWindow);

    return categoryMatches && paymentMatches && queryMatches && dateMatches;
  });

  const summary = buildDashboardSummary(filteredTransactions);

  const addExpense = async (transactionInput: CreateExpensePayload) => {
    const timestamp = new Date(`${transactionInput.date}T12:00:00.000Z`).toISOString();

    const localTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: timestamp,
      amount: transactionInput.amount,
      currency: "INR",
      direction: "debit",
      status: "completed",
      merchant: transactionInput.merchant,
      merchantNormalized: normalizeMerchant(transactionInput.merchant),
      description:
        transactionInput.description ?? `${transactionInput.paymentMethod} payment to ${transactionInput.merchant}`,
      note: transactionInput.note,
      paymentMethod: transactionInput.paymentMethod,
      source: "manual",
      category: transactionInput.category,
      categoryConfidence: transactionInput.categoryConfidence ?? 1,
      isAutoCategorized: transactionInput.isAutoCategorized ?? false,
      tags: ["manual-entry", ...(transactionInput.tags ?? [])],
      rawMessage: transactionInput.rawMessage,
      recoveryReminder: transactionInput.recoveryReminder
        ? {
            status: "open",
            dueDate: transactionInput.recoveryReminder.dueDate,
            reminderDays: transactionInput.recoveryReminder.reminderDays,
            createdAt: new Date().toISOString()
          }
        : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const createdTransaction = await createExpense(transactionInput);
      const transactionWithReminder = localTransaction.recoveryReminder
        ? { ...createdTransaction, recoveryReminder: localTransaction.recoveryReminder }
        : createdTransaction;
      setTransactions((currentTransactions) => [transactionWithReminder, ...currentTransactions]);
      setApiStatus("online");
      setApiMessage("Expense saved to FastAPI backend");
    } catch {
      setTransactions((currentTransactions) => [localTransaction, ...currentTransactions]);
      setApiStatus("offline");
      setApiMessage("Saved locally because the backend is unavailable");
    }
  };

  const addCredit = async (creditInput: UpdateExpensePayload) => {
    const timestamp = new Date(`${creditInput.date}T12:00:00.000Z`).toISOString();
    const merchant = creditInput.merchant.trim();
    const note = creditInput.note?.trim() || undefined;

    setTransactions((currentTransactions) => [
      {
        id: crypto.randomUUID(),
        date: timestamp,
        amount: creditInput.amount,
        currency: "INR",
        direction: "credit",
        status: "completed",
        merchant,
        merchantNormalized: normalizeMerchant(merchant),
        description: note || `${creditInput.paymentMethod} credit from ${merchant}`,
        note,
        paymentMethod: creditInput.paymentMethod,
        source: "manual",
        category: creditInput.category,
        categoryConfidence: 1,
        isAutoCategorized: false,
        tags: ["manual-credit", "local-credit"],
        rawMessage: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      ...currentTransactions
    ]);

    setApiMessage("Credit saved locally and included in dashboard totals");
  };

  const updateExpense = async (
    transactionId: string,
    updates: UpdateExpensePayload
  ) => {
    const existingTransaction = transactions.find((transaction) => transaction.id === transactionId);
    const merchant = updates.merchant.trim();
    const date = new Date(`${updates.date}T12:00:00.000Z`).toISOString();
    const note = updates.note?.trim() || undefined;

    const applyLocalUpdate = (paymentMethod: PaymentMethod) => {
      setTransactions((currentTransactions) =>
        currentTransactions.map((transaction) => {
          if (transaction.id !== transactionId) {
            return transaction;
          }

          return {
            ...transaction,
            merchant,
            merchantNormalized: normalizeMerchant(merchant),
            amount: updates.amount,
            category: updates.category,
            paymentMethod,
            date,
            note,
            description: note || `${paymentMethod} payment to ${merchant}`,
            updatedAt: new Date().toISOString()
          };
        })
      );
    };

    applyLocalUpdate(updates.paymentMethod);

    if (existingTransaction?.direction === "credit") {
      setApiMessage("Credit updated locally");
      return;
    }

    try {
      const updatedTransaction = await updateExpenseById(transactionId, updates);
      setTransactions((currentTransactions) =>
        currentTransactions.map((transaction) =>
          transaction.id === transactionId ? updatedTransaction : transaction
        )
      );

      if (updatedTransaction.paymentMethod !== updates.paymentMethod) {
        setApiMessage(
          "Edit saved, but backend did not persist payment method changes. Update backend ExpenseUpdate to include payment_method."
        );
      } else {
        setApiStatus("online");
        setApiMessage("Transaction updated in backend");
      }
    } catch {
      setApiStatus("offline");
      setApiMessage("Edit saved locally only because backend update failed");
    }
  };

  const markRecoveryReceived = (transactionId: string) => {
    const transaction = transactions.find((entry) => entry.id === transactionId);
    if (!transaction || transaction.recoveryReminder?.status !== "open") {
      return;
    }

    const creditId = crypto.randomUUID();
    const collectedAt = new Date().toISOString();
    const merchant = transaction.merchant ?? "Recovered amount";

    setTransactions((currentTransactions) => [
      {
        id: creditId,
        date: collectedAt,
        amount: transaction.amount,
        currency: "INR",
        direction: "credit",
        status: "completed",
        merchant,
        merchantNormalized: normalizeMerchant(merchant),
        description: `Recovered amount from ${merchant}`,
        note: `Collected back for ${transaction.description}`,
        paymentMethod: transaction.paymentMethod,
        source: "manual",
        category: "Transfer",
        categoryConfidence: 1,
        isAutoCategorized: false,
        tags: ["recovery-credit"],
        createdAt: collectedAt,
        updatedAt: collectedAt
      },
      ...currentTransactions.map((entry) =>
        entry.id === transactionId
          ? {
              ...entry,
              recoveryReminder: {
                ...entry.recoveryReminder!,
                status: "collected" as const,
                collectedAt,
                collectionCreditId: creditId
              },
              updatedAt: collectedAt
            }
          : entry
      )
    ]);

    setApiMessage("Recovered amount added to credits");
  };

  return {
    transactions,
    filteredTransactions,
    filters,
    setFilters,
    importJobs,
    summary,
    apiStatus,
    apiMessage,
    addExpense,
    addCredit,
    updateExpense,
    markRecoveryReceived
  };
};

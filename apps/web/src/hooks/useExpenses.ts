import { useEffect, useState } from "react";
import {
  buildDashboardSummary,
  formatCurrency,
  normalizeMerchant,
  type ExpenseCategory,
  type PaymentMethod,
  type Transaction
} from "@expenses/shared";
import { useAuth } from "../auth/AuthContext";
import {
  createExpense,
  createCredit,
  createReceivable,
  deleteTransactionById,
  fetchExpenses,
  fetchCredits,
  fetchReceivables,
  markReceivableReceived,
  updateExpenseById,
  type CreateExpensePayload,
  type UpdateExpensePayload
} from "../services/expensesApi";
import { ApiError } from "../services/api";
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
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return loadTransactions(user?.id);
  });
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [apiStatus, setApiStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  useEffect(() => {
    saveTransactions(transactions, user?.id);
  }, [transactions, user?.id]);

  useEffect(() => {
    setTransactions(loadTransactions(user?.id));
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    const syncTransactions = async () => {
      try {
        const [remoteExpenses, remoteCredits, remoteReceivables] = await Promise.all([
          fetchExpenses(),
          fetchCredits(),
          fetchReceivables()
        ]);
        if (cancelled) {
          return;
        }

        setTransactions((currentTransactions) => {
          const localTransactionMap = new Map(currentTransactions.map((transaction) => [transaction.id, transaction]));
          const receivablesByExpenseId = new Map(
            remoteReceivables
              .filter((receivable) => receivable.expenseId)
              .map((receivable) => [receivable.expenseId!, receivable])
          );

          const mergeReceivable = (transaction: Transaction) => {
            const receivable = receivablesByExpenseId.get(transaction.id);
            if (!receivable) {
              return transaction;
            }

            return {
              ...transaction,
              recoveryReminder: {
                status: receivable.status,
                dueDate: receivable.remindAt,
                reminderDays: Math.max(
                  1,
                  Math.round(
                    (new Date(receivable.remindAt).getTime() -
                      new Date(transaction.date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                ),
                createdAt: receivable.createdAt,
                collectionCreditId: receivable.receivedTransactionId,
                collectedAt: receivable.receivedAt
              }
            };
          };

          return [
            ...remoteCredits.map((transaction) => {
              const localTransaction = localTransactionMap.get(transaction.id);
              return localTransaction?.recoveryReminder
                ? { ...transaction, recoveryReminder: localTransaction.recoveryReminder }
                : transaction;
            }),
            ...remoteExpenses.map((transaction) => {
              const mergedTransaction = mergeReceivable(transaction);
              const localTransaction = localTransactionMap.get(mergedTransaction.id);

              return localTransaction?.recoveryReminder
                ? { ...mergedTransaction, recoveryReminder: localTransaction.recoveryReminder }
                : mergedTransaction;
            })
          ];
        });
        setApiStatus("online");
        setApiMessage("Connected to FastAPI backend");
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          setApiStatus("offline");
          setApiMessage("Your session expired. Please sign in again.");
          void logout();
          return;
        }

        setApiStatus("offline");
        setApiMessage("Backend unavailable, using locally stored entries");
      }
    };

    void syncTransactions();

    return () => {
      cancelled = true;
    };
  }, [logout]);

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

  const handleUnauthorized = async (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      setApiStatus("offline");
      setApiMessage("Your session expired. Please sign in again.");
      await logout();
      return true;
    }

    return false;
  };

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
      let transactionWithReminder = createdTransaction;

      if (transactionInput.recoveryReminder) {
        const receivable = await createReceivable({
          amount: createdTransaction.amount,
          title: createdTransaction.merchant ?? transactionInput.merchant ?? "Recoverable payment",
          note: transactionInput.note,
          remindAt: transactionInput.recoveryReminder.dueDate,
          expenseId: createdTransaction.id
        });

        transactionWithReminder = {
          ...createdTransaction,
          recoveryReminder: {
            status: receivable.status,
            dueDate: receivable.remindAt,
            reminderDays: transactionInput.recoveryReminder.reminderDays,
            createdAt: receivable.createdAt,
            collectionCreditId: receivable.receivedTransactionId,
            collectedAt: receivable.receivedAt
          }
        };
      }

      setTransactions((currentTransactions) => [transactionWithReminder, ...currentTransactions]);
      setApiStatus("online");
      setApiMessage("Expense saved to FastAPI backend");
    } catch (error) {
      if (await handleUnauthorized(error)) {
        return;
      }

      setTransactions((currentTransactions) => [localTransaction, ...currentTransactions]);
      setApiStatus("offline");
      setApiMessage("Saved locally because the backend is unavailable");
    }
  };

  const addCredit = async (creditInput: UpdateExpensePayload) => {
    const timestamp = new Date(`${creditInput.date}T12:00:00.000Z`).toISOString();
    const merchant = creditInput.merchant.trim();
    const note = creditInput.note?.trim() || undefined;

    const localCredit: Transaction = {
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
    };

    try {
      const createdCredit = await createCredit(creditInput);
      setTransactions((currentTransactions) => [createdCredit, ...currentTransactions]);
      setApiStatus("online");
      setApiMessage("Credit saved to FastAPI backend");
    } catch (error) {
      if (await handleUnauthorized(error)) {
        return;
      }

      setTransactions((currentTransactions) => [localCredit, ...currentTransactions]);
      setApiMessage("Credit saved locally and included in dashboard totals");
    }
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
    } catch (error) {
      if (await handleUnauthorized(error)) {
        return;
      }

      setApiStatus("offline");
      setApiMessage("Edit saved locally only because backend update failed");
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    const existingTransaction = transactions.find((transaction) => transaction.id === transactionId);
    if (!existingTransaction) {
      return;
    }

    const removeTransaction = () => {
      setTransactions((currentTransactions) =>
        currentTransactions.filter((transaction) => transaction.id !== transactionId)
      );
    };
    const linkedRecoveryCreditId = existingTransaction.recoveryReminder?.collectionCreditId;

    removeTransaction();

    if (linkedRecoveryCreditId) {
      setTransactions((currentTransactions) =>
        currentTransactions.filter((transaction) => transaction.id !== linkedRecoveryCreditId)
      );
    }

    try {
      await deleteTransactionById(transactionId);
      setApiStatus("online");
      setApiMessage("Transaction deleted from backend");
    } catch (error) {
      if (await handleUnauthorized(error)) {
        return;
      }

      setApiStatus("offline");
      setApiMessage("Transaction removed locally only because backend delete failed");
    }
  };

  const markRecoveryReceived = async (transactionId: string) => {
    const transaction = transactions.find((entry) => entry.id === transactionId);
    if (!transaction || transaction.recoveryReminder?.status !== "open") {
      return;
    }
    const collectedAt = new Date().toISOString();

    try {
      const receivables = await fetchReceivables();
      const matchingReceivable = receivables.find((receivable) => receivable.expenseId === transactionId);
      if (!matchingReceivable) {
        setApiMessage("Could not find the linked receivable in backend");
        return;
      }

      const updatedReceivable = await markReceivableReceived({
        reminderId: matchingReceivable.id,
        paymentMethod: transaction.paymentMethod,
        receivedAt: collectedAt,
        note: `Collected back for ${transaction.description}`
      });

      const latestCredits = await fetchCredits();
      const receivedCredit = latestCredits.find(
        (entry) => entry.id === updatedReceivable.receivedTransactionId
      );

      setTransactions((currentTransactions) => {
        const creditRows = currentTransactions.filter(
          (entry) => entry.direction === "credit" && entry.id !== updatedReceivable.receivedTransactionId
        );
        const debitRows = currentTransactions.map((entry) =>
          entry.id === transactionId
            ? {
                ...entry,
                recoveryReminder: {
                  ...entry.recoveryReminder!,
                  status: "collected" as const,
                  collectedAt: updatedReceivable.receivedAt ?? collectedAt,
                  collectionCreditId: updatedReceivable.receivedTransactionId
                },
                updatedAt: updatedReceivable.updatedAt
              }
            : entry
        );

        return receivedCredit ? [receivedCredit, ...creditRows, ...debitRows.filter((entry) => entry.direction !== "credit")] : [...creditRows, ...debitRows.filter((entry) => entry.direction !== "credit")];
      });

      setApiMessage("Recovered amount added to credits");
    } catch (error) {
      if (await handleUnauthorized(error)) {
        return;
      }

      setApiMessage("Could not mark the receivable as received right now");
    }
  };

  return {
    transactions,
    filteredTransactions,
    filters,
    setFilters,
    summary,
    apiStatus,
    apiMessage,
    addExpense,
    addCredit,
    updateExpense,
    deleteTransaction,
    markRecoveryReceived
  };
};

import type { Transaction } from "@expenses/shared";
import { transactionRepository } from "../repositories/transaction.repository";

export const transactionService = {
  listTransactions: () => transactionRepository.list(),
  addTransaction: (transaction: Transaction) => transactionRepository.add(transaction)
};

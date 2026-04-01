import type { Transaction } from "@expenses/shared";

export const dedupeService = {
  isDuplicate(existingTransactions: Transaction[], candidate: Transaction) {
    return existingTransactions.some(
      (transaction) =>
        transaction.externalId !== undefined &&
        transaction.externalId === candidate.externalId
    );
  }
};

import { normalizeMerchant, type Transaction } from "@expenses/shared";

export const parseEmailAlert = (subject: string, body: string): Partial<Transaction> => ({
  description: subject,
  merchantNormalized: normalizeMerchant(subject),
  rawMessage: body
});

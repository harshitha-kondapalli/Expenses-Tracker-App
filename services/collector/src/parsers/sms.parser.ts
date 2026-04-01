import { normalizeMerchant, type Transaction } from "@expenses/shared";

export const parseSmsMessage = (message: string): Partial<Transaction> => ({
  description: message,
  merchant: message.split(" to ")[1]?.split(" on ")[0]?.trim(),
  merchantNormalized: normalizeMerchant(message.split(" to ")[1]?.split(" on ")[0]?.trim()),
  rawMessage: message
});

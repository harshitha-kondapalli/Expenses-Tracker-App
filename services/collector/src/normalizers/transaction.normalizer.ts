import {
  normalizeMerchant,
  type PaymentMethod,
  type Transaction,
  type TransactionSource
} from "@expenses/shared";

export const normalizeTransaction = (
  payload: Partial<Transaction>,
  source: TransactionSource
): Transaction => {
  const timestamp = new Date().toISOString();
  const description = payload.description ?? "Collected transaction";
  const merchant = payload.merchant ?? description;

  return {
    id: payload.id ?? `txn-${Date.now()}`,
    externalId: payload.externalId,
    date: payload.date ?? timestamp,
    amount: payload.amount ?? 0,
    currency: "INR",
    direction: payload.direction ?? "debit",
    status: payload.status ?? "completed",
    merchant,
    merchantNormalized: payload.merchantNormalized ?? normalizeMerchant(merchant),
    description,
    note: payload.note,
    paymentMethod: (payload.paymentMethod ?? "Other") as PaymentMethod,
    source,
    sourceRef: payload.sourceRef,
    accountLast4: payload.accountLast4,
    upiHandle: payload.upiHandle,
    cardNetwork: payload.cardNetwork,
    category: payload.category ?? "Other",
    categoryConfidence: payload.categoryConfidence,
    isAutoCategorized: payload.isAutoCategorized ?? true,
    tags: payload.tags ?? [],
    rawMessage: payload.rawMessage,
    rawPayload: payload.rawPayload,
    createdAt: payload.createdAt ?? timestamp,
    updatedAt: payload.updatedAt ?? timestamp
  };
};

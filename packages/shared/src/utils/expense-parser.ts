import { expenseCategories, type ExpenseCategory } from "../constants/categories";
import { type PaymentMethod } from "../constants/payment-methods";
import type {
  ExpenseParserHistoryEntry,
  ParseExpenseInputOptions,
  ParsedExpenseInput
} from "../types/expense-parser";
import { normalizeMerchant } from "./normalize";

const fillerWords = /\b(spent|pay|paid|for|on|at|to|towards|via|using|with|from)\b/gi;

const paymentMethodKeywords: Array<{ method: PaymentMethod; keywords: string[] }> = [
  { method: "UPI", keywords: ["upi", "gpay", "google pay", "phonepe", "paytm", "bhim"] },
  { method: "Card", keywords: ["card", "credit card", "debit card", "visa", "mastercard", "rupay"] },
  { method: "Cash", keywords: ["cash"] },
  { method: "Wallet", keywords: ["wallet"] },
  { method: "NetBanking", keywords: ["netbanking", "bank transfer", "imps", "neft", "rtgs"] }
];

const categoryKeywords: Array<{ category: ExpenseCategory; keywords: string[] }> = [
  {
    category: "Food",
    keywords: [
      "swiggy",
      "zomato",
      "restaurant",
      "cafe",
      "tea",
      "coffee",
      "breakfast",
      "lunch",
      "dinner",
      "snack",
      "meal",
      "veg",
      "vegetable",
      "vegetables"
    ]
  },
  {
    category: "Groceries",
    keywords: ["groceries", "grocery", "bigbasket", "blinkit", "zepto", "instamart", "milk", "rice", "dal"]
  },
  {
    category: "Transport",
    keywords: ["uber", "ola", "metro", "bus", "auto", "taxi", "cab", "fuel", "petrol", "diesel"]
  },
  {
    category: "Bills",
    keywords: ["bill", "electricity", "water", "internet", "wifi", "broadband", "gas"]
  },
  {
    category: "Health",
    keywords: ["pharmacy", "apollo", "medicine", "medicines", "doctor", "clinic", "hospital"]
  },
  {
    category: "Entertainment",
    keywords: ["movie", "netflix", "spotify", "pvr", "concert", "game"]
  },
  {
    category: "Travel",
    keywords: ["flight", "hotel", "trip", "makemytrip", "train", "booking", "airbnb"]
  },
  {
    category: "Shopping",
    keywords: ["amazon", "flipkart", "myntra", "shopping", "shirt", "shoes", "order"]
  },
  {
    category: "Recharge",
    keywords: ["recharge", "topup", "top up", "airtel", "jio", "vi"]
  },
  {
    category: "Education",
    keywords: ["course", "fees", "tuition", "udemy", "book", "books", "class"]
  },
  { category: "Rent", keywords: ["rent", "landlord"] },
  { category: "Transfer", keywords: ["transfer", "sent", "withdrawal"] }
];

const titleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const stripAmountAndFillerWords = (input: string, amountToken?: string) => {
  const withoutAmount = amountToken ? input.replace(amountToken, " ") : input;

  return withoutAmount
    .replace(/₹|rs\.?|inr/gi, " ")
    .replace(fillerWords, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const findPaymentMethod = (input: string, fallback: PaymentMethod) => {
  const normalizedInput = input.toLowerCase();

  for (const entry of paymentMethodKeywords) {
    if (entry.keywords.some((keyword) => normalizedInput.includes(keyword))) {
      return entry.method;
    }
  }

  return fallback;
};

const findHistoryMatch = (normalizedNote: string, existingTransactions: ExpenseParserHistoryEntry[]) => {
  if (!normalizedNote) {
    return undefined;
  }

  const rankedMatches = existingTransactions
    .map((transaction) => {
      const merchantNormalized =
        transaction.merchantNormalized || normalizeMerchant(transaction.merchant || transaction.note || "");
      const descriptionNormalized = normalizeMerchant(transaction.description || "");
      const noteNormalized = normalizeMerchant(transaction.note || "");

      let score = 0;
      if (merchantNormalized && merchantNormalized === normalizedNote) {
        score = 5;
      } else if (merchantNormalized && normalizedNote.includes(merchantNormalized)) {
        score = 4;
      } else if (merchantNormalized && merchantNormalized.includes(normalizedNote)) {
        score = 3;
      } else if (descriptionNormalized && descriptionNormalized.includes(normalizedNote)) {
        score = 2;
      } else if (noteNormalized && noteNormalized.includes(normalizedNote)) {
        score = 1;
      }

      return score > 0 ? { transaction, score } : undefined;
    })
    .filter((entry): entry is { transaction: ExpenseParserHistoryEntry; score: number } => Boolean(entry))
    .sort((left, right) => right.score - left.score);

  return rankedMatches[0]?.transaction;
};

const findKeywordCategory = (normalizedNote: string) => {
  for (const entry of categoryKeywords) {
    const keyword = entry.keywords.find((candidate) => normalizedNote.includes(candidate));
    if (keyword) {
      return {
        category: entry.category,
        keyword
      };
    }
  }

  return undefined;
};

export const parseExpenseInput = (
  input: string,
  options: ParseExpenseInputOptions = {}
): ParsedExpenseInput => {
  const rawInput = input.trim();
  const amountMatch = rawInput.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? Number(amountMatch[1]) : null;
  const note = stripAmountAndFillerWords(rawInput, amountMatch?.[0]);
  const normalizedNote = normalizeMerchant(note);
  const paymentMethod = findPaymentMethod(rawInput, options.defaultPaymentMethod ?? "UPI");
  const historyMatch = findHistoryMatch(normalizedNote, options.existingTransactions ?? []);
  const keywordMatch = findKeywordCategory(normalizedNote);

  const category = historyMatch?.category ?? keywordMatch?.category ?? "Other";
  const categoryConfidence = historyMatch ? 0.96 : keywordMatch ? 0.82 : note ? 0.45 : 0;
  const merchant =
    historyMatch?.merchant ||
    historyMatch?.note ||
    titleCase(note || rawInput.replace(/\s+/g, " ").trim()) ||
    "Manual Entry";

  return {
    rawInput,
    amount,
    merchant,
    note,
    category: expenseCategories.includes(category) ? category : "Other",
    paymentMethod: historyMatch?.paymentMethod ?? paymentMethod,
    categoryConfidence,
    isAutoCategorized: categoryConfidence >= 0.7,
    matchedKeyword: keywordMatch?.keyword,
    matchedHistoryMerchant: historyMatch?.merchant
  };
};

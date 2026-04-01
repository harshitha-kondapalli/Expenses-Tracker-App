import { normalizeMerchant, type CategoryRule, type ExpenseCategory, type Transaction } from "@expenses/shared";

const defaultRules: CategoryRule[] = [
  { id: "rule-1", matchType: "contains", pattern: "swiggy", category: "Food", priority: 100, isActive: true },
  { id: "rule-2", matchType: "contains", pattern: "uber", category: "Transport", priority: 90, isActive: true },
  { id: "rule-3", matchType: "contains", pattern: "amazon", category: "Shopping", priority: 80, isActive: true }
];

const matchRule = (merchant: string, rule: CategoryRule) => {
  if (!rule.isActive) {
    return false;
  }

  if (rule.matchType === "equals") {
    return merchant === rule.pattern;
  }

  if (rule.matchType === "regex") {
    return new RegExp(rule.pattern, "i").test(merchant);
  }

  return merchant.includes(rule.pattern.toLowerCase());
};

export const categorizationService = {
  rules: defaultRules,
  categorize(transaction: Transaction): ExpenseCategory {
    const normalized = normalizeMerchant(transaction.merchant ?? transaction.description);
    const orderedRules = [...defaultRules].sort((left, right) => right.priority - left.priority);
    const matchedRule = orderedRules.find((rule) => matchRule(normalized, rule));
    return matchedRule?.category ?? "Other";
  }
};

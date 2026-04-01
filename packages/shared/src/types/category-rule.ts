import type { ExpenseCategory } from "../constants/categories";

export interface CategoryRule {
  id: string;
  matchType: "contains" | "equals" | "regex";
  pattern: string;
  category: ExpenseCategory;
  priority: number;
  isActive: boolean;
}

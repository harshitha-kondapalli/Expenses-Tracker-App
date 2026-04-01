export const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Travel",
  "Groceries",
  "Recharge",
  "Education",
  "Rent",
  "Salary",
  "Transfer",
  "Other"
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

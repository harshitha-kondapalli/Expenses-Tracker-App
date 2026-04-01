import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Expense } from "@expenses/shared";

const STORAGE_KEY = "expenses-tracker-mobile";

export const loadExpenses = async (): Promise<Expense[]> => {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as Expense[];
  } catch {
    return [];
  }
};

export const saveExpenses = async (expenses: Expense[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

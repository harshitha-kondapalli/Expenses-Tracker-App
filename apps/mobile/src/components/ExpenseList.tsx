import { StyleSheet, Text, View } from "react-native";
import { formatCurrency, type Expense } from "@expenses/shared";

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => (
  <View style={styles.card}>
    <Text style={styles.eyebrow}>Recent expenses</Text>
    <Text style={styles.heading}>Latest activity</Text>

    <View style={styles.list}>
      {expenses.map((expense) => (
        <View key={expense.id} style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.title}>{expense.title}</Text>
            <Text style={styles.meta}>
              {expense.category} • {expense.date}
            </Text>
          </View>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.92)",
    gap: 12
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    color: "#c45b2d",
    fontWeight: "700"
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#122238"
  },
  list: {
    gap: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(18,34,56,0.08)"
  },
  copy: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#122238"
  },
  meta: {
    marginTop: 4,
    color: "#60758d"
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#122238"
  }
});

import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "@expenses/shared";
import { ExpenseForm } from "./src/components/ExpenseForm";
import { ExpenseList } from "./src/components/ExpenseList";
import { SummaryStrip } from "./src/components/SummaryStrip";
import { useExpenses } from "./src/hooks/useExpenses";

export default function App() {
  const { expenses, summary, addExpense } = useExpenses();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Mobile tracking</Text>
          <Text style={styles.title}>Capture daily spending wherever you are.</Text>
          <Text style={styles.copy}>
            Add expenses on the go, review monthly progress, and keep your budget visible from your phone.
          </Text>
        </View>

        <SummaryStrip
          items={[
            { label: "Total", value: formatCurrency(summary.totalSpent) },
            { label: "This month", value: formatCurrency(summary.monthlySpent) },
            { label: "Entries", value: String(expenses.length) }
          ]}
        />

        <ExpenseForm onSubmit={addExpense} />
        <ExpenseList expenses={summary.recentExpenses} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5efe4"
  },
  container: {
    padding: 20,
    gap: 18
  },
  hero: {
    gap: 8
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    color: "#c45b2d",
    fontWeight: "700"
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    color: "#122238",
    fontWeight: "800"
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    color: "#516780"
  }
});

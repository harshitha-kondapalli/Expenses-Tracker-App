import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { expenseCategories, type Expense, type ExpenseCategory } from "@expenses/shared";

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, "id">) => void;
}

const today = new Date().toISOString().slice(0, 10);

export const ExpenseForm = ({ onSubmit }: ExpenseFormProps) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const parsedAmount = Number(amount);
    if (!title.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    onSubmit({
      title: title.trim(),
      amount: parsedAmount,
      category,
      date: today,
      note: note.trim() || undefined
    });

    setTitle("");
    setAmount("");
    setCategory("Food");
    setNote("");
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Add expense</Text>
      <Text style={styles.heading}>Quick entry</Text>

      <TextInput
        style={styles.input}
        placeholder="Expense title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.categoryWrap}>
        {expenseCategories.map((expenseCategory) => {
          const isActive = expenseCategory === category;

          return (
            <Pressable
              key={expenseCategory}
              onPress={() => setCategory(expenseCategory)}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                {expenseCategory}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        style={[styles.input, styles.noteInput]}
        placeholder="Optional note"
        value={note}
        onChangeText={setNote}
        multiline
      />

      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Save expense</Text>
      </Pressable>
    </View>
  );
};

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
  input: {
    borderWidth: 1,
    borderColor: "rgba(18,34,56,0.12)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff"
  },
  noteInput: {
    minHeight: 88,
    textAlignVertical: "top"
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f0ede7"
  },
  categoryChipActive: {
    backgroundColor: "#132238"
  },
  categoryChipText: {
    color: "#4f637c",
    fontWeight: "600"
  },
  categoryChipTextActive: {
    color: "#fff"
  },
  button: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#132238",
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700"
  }
});

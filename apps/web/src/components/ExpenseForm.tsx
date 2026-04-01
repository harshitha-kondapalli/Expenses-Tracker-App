import { useState, type FormEvent } from "react";
import { expenseCategories, type Expense, type ExpenseCategory } from "@expenses/shared";

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, "id">) => void;
}

const today = new Date().toISOString().slice(0, 10);

export const ExpenseForm = ({ onSubmit }: ExpenseFormProps) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!title.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    onSubmit({
      title: title.trim(),
      amount: parsedAmount,
      category,
      date,
      note: note.trim() || undefined
    });

    setTitle("");
    setAmount("");
    setCategory("Food");
    setDate(today);
    setNote("");
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <p className="eyebrow">Add expense</p>
        <h2>Track spending in a few seconds</h2>
      </div>

      <label>
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Coffee, rent, groceries..."
        />
      </label>

      <div className="form-grid">
        <label>
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value as ExpenseCategory)}>
            {expenseCategories.map((expenseCategory) => (
              <option key={expenseCategory} value={expenseCategory}>
                {expenseCategory}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Date
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      <label>
        Note
        <textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note"
        />
      </label>

      <button type="submit">Save expense</button>
    </form>
  );
};

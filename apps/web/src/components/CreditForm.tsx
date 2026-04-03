import { useState, type FormEvent } from "react";
import {
  paymentMethods,
  type ExpenseCategory,
  type PaymentMethod
} from "@expenses/shared";

interface CreditFormProps {
  onSubmit: (credit: {
    merchant: string;
    amount: number;
    category: ExpenseCategory;
    paymentMethod: PaymentMethod;
    date: string;
    note?: string;
  }) => void | Promise<void>;
}

const creditCategories: ExpenseCategory[] = ["Salary", "Transfer", "Other"];
const today = new Date().toISOString().slice(0, 10);

export const CreditForm = ({ onSubmit }: CreditFormProps) => {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Salary");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving">("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!merchant.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    setStatus("saving");

    try {
      await Promise.resolve(
        onSubmit({
          merchant: merchant.trim(),
          amount: parsedAmount,
          category,
          paymentMethod,
          date,
          note: note.trim() || undefined
        })
      );

      setMerchant("");
      setAmount("");
      setCategory("Salary");
      setPaymentMethod("UPI");
      setDate(today);
      setNote("");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <p className="eyebrow">Add credit</p>
        <h2>Capture salary, transfers, and incoming money</h2>
        <p className="panel-copy">
          Keep credits separate from expenses so the dashboard can show actual inflow, outflow, and net
          position.
        </p>
      </div>

      <label>
        Credit source
        <input
          value={merchant}
          onChange={(event) => setMerchant(event.target.value)}
          placeholder="Salary, refund, friend transfer..."
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
          Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value as ExpenseCategory)}>
            {creditCategories.map((creditCategory) => (
              <option key={creditCategory} value={creditCategory}>
                {creditCategory}
              </option>
            ))}
          </select>
        </label>

        <label>
          Payment method
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Note
        <textarea
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note, bank reference, or salary month"
        />
      </label>

      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save credit"}
      </button>
    </form>
  );
};

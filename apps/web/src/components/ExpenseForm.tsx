import { useEffect, useState, type FormEvent } from "react";
import {
  expenseCategories,
  paymentMethods,
  type ExpenseCategory,
  type PaymentMethod,
  type ParsedExpenseInput,
  type Transaction
} from "@expenses/shared";
import { parseExpenseWithApi } from "../services/expensesApi";

interface ExpenseFormProps {
  transactions: Transaction[];
  onSubmit: (
    transaction: Pick<Transaction, "merchant" | "amount" | "category" | "paymentMethod" | "date" | "note"> & {
      description?: string;
      categoryConfidence?: number;
      isAutoCategorized?: boolean;
      rawMessage?: string;
      tags?: string[];
      recoveryReminder?: {
        dueDate: string;
        reminderDays: number;
      };
    }
  ) => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
  eyebrow?: string;
}

const today = new Date().toISOString().slice(0, 10);

const formatConfidenceLabel = (confidence: number) => {
  if (confidence >= 0.95) {
    return "Matched from your history";
  }

  if (confidence >= 0.8) {
    return "Matched from a category keyword";
  }

  if (confidence > 0) {
    return "Needs a quick review";
  }

  return "Waiting for amount and note";
};

export const ExpenseForm = ({
  transactions,
  onSubmit,
  onCancel,
  title = "Type one line, then confirm the parser preview",
  eyebrow = "Smart entry"
}: ExpenseFormProps) => {
  const [smartInput, setSmartInput] = useState("");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [collectBack, setCollectBack] = useState(false);
  const [reminderDays, setReminderDays] = useState("3");
  const [parsedPreview, setParsedPreview] = useState<ParsedExpenseInput>({
    rawInput: "",
    amount: null,
    merchant: "Manual Entry",
    note: "",
    category: "Other",
    paymentMethod: "UPI",
    categoryConfidence: 0,
    isAutoCategorized: false,
    matchedKeyword: undefined,
    matchedHistoryMerchant: undefined
  });
  const [parseStatus, setParseStatus] = useState<"idle" | "loading">("idle");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving">("idle");

  useEffect(() => {
    if (!smartInput.trim()) {
      setParsedPreview({
        rawInput: "",
        amount: null,
        merchant: "Manual Entry",
        note: "",
        category: "Other",
        paymentMethod: "UPI",
        categoryConfidence: 0,
        isAutoCategorized: false,
        matchedKeyword: undefined,
        matchedHistoryMerchant: undefined
      });
      setMerchant("");
      setAmount("");
      setCategory("Food");
      setNote("");
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setParseStatus("loading");

      try {
        const nextPreview = await parseExpenseWithApi(smartInput, transactions, paymentMethod);
        setParsedPreview(nextPreview);
        setMerchant(nextPreview.merchant);
        setAmount(nextPreview.amount ? String(nextPreview.amount) : "");
        setCategory(nextPreview.category);
        setPaymentMethod(nextPreview.paymentMethod);
        setNote(nextPreview.note);
      } finally {
        setParseStatus("idle");
      }
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [smartInput, transactions]);

  const resetForm = () => {
    setSmartInput("");
    setMerchant("");
    setAmount("");
    setCategory("Food");
    setPaymentMethod("UPI");
    setDate(today);
    setNote("");
    setCollectBack(false);
    setReminderDays("3");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    const trimmedMerchant = merchant.trim() || note.trim();
    const trimmedNote = note.trim();

    if (!trimmedMerchant || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    setSubmitStatus("saving");

    try {
      const dueDate = new Date(`${date}T12:00:00.000Z`);
      dueDate.setDate(dueDate.getDate() + Number(reminderDays));

      await Promise.resolve(
        onSubmit({
          merchant: trimmedMerchant,
          amount: parsedAmount,
          category,
          paymentMethod,
          date,
          note: trimmedNote || undefined,
          description:
            smartInput.trim().length > 0
              ? `${paymentMethod} payment parsed from "${smartInput.trim()}"`
              : `${paymentMethod} payment to ${trimmedMerchant}`,
          categoryConfidence: parsedPreview.categoryConfidence,
          isAutoCategorized: parsedPreview.isAutoCategorized,
          rawMessage: smartInput.trim() || undefined,
          tags: parsedPreview.matchedHistoryMerchant
            ? ["history-match"]
            : parsedPreview.matchedKeyword
              ? ["keyword-match"]
              : [],
          recoveryReminder: collectBack
            ? {
                dueDate: dueDate.toISOString(),
                reminderDays: Number(reminderDays)
              }
            : undefined
        })
      );

      resetForm();
      onCancel?.();
    } finally {
      setSubmitStatus("idle");
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="composer-header">
        <div className="section-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="panel-copy">
            Try <strong>100 vegetables</strong>, <strong>250 swiggy</strong>, or <strong>500 rent</strong>.
          </p>
        </div>

        {onCancel ? (
          <button
            type="button"
            className="close-button"
            aria-label="Close add expense form"
            onClick={onCancel}
          >
            x
          </button>
        ) : null}
      </div>

      <label>
        Quick add
        <input
          value={smartInput}
          onChange={(event) => setSmartInput(event.target.value)}
          placeholder="100 vegetables"
        />
      </label>

      <div className="parser-preview">
        <div className="parser-preview-copy">
          <p>Parser preview</p>
          <strong>
            {parsedPreview.amount ? `₹${parsedPreview.amount.toFixed(2)}` : "Amount not detected yet"}
          </strong>
          <span>
            {parseStatus === "loading"
              ? "Parsing input..."
              : formatConfidenceLabel(parsedPreview.categoryConfidence)}
          </span>
        </div>
        <div className="parser-preview-grid">
          <div>
            <span>Category</span>
            <strong>{parsedPreview.category}</strong>
          </div>
          <div>
            <span>Merchant</span>
            <strong>{parsedPreview.merchant}</strong>
          </div>
          <div>
            <span>Note</span>
            <strong>{parsedPreview.note || "Will stay empty"}</strong>
          </div>
          <div>
            <span>Payment</span>
            <strong>{parsedPreview.paymentMethod}</strong>
          </div>
        </div>
      </div>

      <label>
        Merchant
        <input
          value={merchant}
          onChange={(event) => setMerchant(event.target.value)}
          placeholder="Swiggy, Amazon, Uber..."
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

      <div className="recovery-box">
        <label className="checkbox-row">
          <input type="checkbox" checked={collectBack} onChange={(event) => setCollectBack(event.target.checked)} />
          <span>Remind me to collect this amount back</span>
        </label>

        {collectBack ? (
          <label className="filter-control">
            <span>Reminder after</span>
            <select value={reminderDays} onChange={(event) => setReminderDays(event.target.value)}>
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </label>
        ) : null}
      </div>

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={submitStatus === "saving"}>
          {submitStatus === "saving" ? "Saving..." : "Save expense"}
        </button>
      </div>
    </form>
  );
};

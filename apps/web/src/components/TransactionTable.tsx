import { useEffect, useState, type FormEvent } from "react";
import {
  expenseCategories,
  formatCurrency,
  paymentMethods,
  type ExpenseCategory,
  type PaymentMethod,
  type Transaction
} from "@expenses/shared";

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdate: (
    transactionId: string,
    updates: {
      merchant: string;
      amount: number;
      category: ExpenseCategory;
      paymentMethod: PaymentMethod;
      date: string;
      note?: string;
    }
  ) => void;
  onDelete: (transactionId: string) => void;
}

const toInputDate = (date: string) => new Date(date).toISOString().slice(0, 10);

export const TransactionTable = ({ transactions, onUpdate, onDelete }: TransactionTableProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(transactions[0]?.id ?? null);
  const selectedTransaction = transactions.find((transaction) => transaction.id === selectedId) ?? null;
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!selectedTransaction && transactions[0]) {
      setSelectedId(transactions[0].id);
      return;
    }

    if (!selectedTransaction) {
      return;
    }

    setMerchant(selectedTransaction.merchant ?? "");
    setAmount(String(selectedTransaction.amount));
    setCategory(selectedTransaction.category);
    setPaymentMethod(selectedTransaction.paymentMethod);
    setDate(toInputDate(selectedTransaction.date));
    setNote(selectedTransaction.note ?? "");
  }, [selectedTransaction, transactions]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTransaction) {
      return;
    }

    const parsedAmount = Number(amount);
    if (!merchant.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !date) {
      return;
    }

    onUpdate(selectedTransaction.id, {
      merchant: merchant.trim(),
      amount: parsedAmount,
      category,
      paymentMethod,
      date,
      note: note.trim() || undefined
    });
  };

  const handleDelete = () => {
    if (!selectedTransaction) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedTransaction.merchant ?? "this transaction"} from the ledger?`
    );
    if (!confirmed) {
      return;
    }

    onDelete(selectedTransaction.id);
    const nextTransaction = transactions.find((transaction) => transaction.id !== selectedTransaction.id) ?? null;
    setSelectedId(nextTransaction?.id ?? null);
  };

  return (
    <section className="panel table-panel">
      <div className="section-heading">
        <p className="eyebrow">Ledger</p>
        <h2>Review, reopen, and correct transactions</h2>
      </div>

      <div className="ledger-layout">
        <div className="table-scroll">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Category</th>
                <th>Method</th>
                <th>Source</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const isSelected = transaction.id === selectedId;

                return (
                  <tr key={transaction.id} className={isSelected ? "transaction-row-active" : undefined}>
                    <td>
                      <strong>{transaction.merchant ?? "Unknown"}</strong>
                      <p>{transaction.description}</p>
                    </td>
                    <td>{transaction.category}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>{transaction.source}</td>
                    <td>{new Date(transaction.date).toLocaleDateString("en-IN")}</td>
                    <td>{formatCurrency(transaction.amount, "INR", "en-IN")}</td>
                    <td>
                      <button type="button" className="ghost-button" onClick={() => setSelectedId(transaction.id)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="editor-panel">
          <div className="section-heading">
            <p className="eyebrow">Editor</p>
            <h2>{selectedTransaction ? "Refine this transaction" : "Select a transaction"}</h2>
          </div>

          {selectedTransaction ? (
            <form className="editor-form" onSubmit={handleSubmit}>
              <label>
                Merchant
                <input value={merchant} onChange={(event) => setMerchant(event.target.value)} />
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
                    {expenseCategories.map((expenseCategory) => (
                      <option key={expenseCategory} value={expenseCategory}>
                        {expenseCategory}
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
                <textarea rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
              </label>

              <div className="editor-actions">
                <button type="submit">Save edits</button>
                <button type="button" className="danger-button" onClick={handleDelete}>
                  Delete transaction
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-box">No transaction selected yet.</div>
          )}
        </aside>
      </div>
    </section>
  );
};

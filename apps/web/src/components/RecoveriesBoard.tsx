import { formatCurrency, type Transaction } from "@expenses/shared";

interface RecoveriesBoardProps {
  transactions: Transaction[];
  onMarkReceived: (transactionId: string) => void;
}

const formatDueLabel = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Due now";
  }

  if (diffDays === 1) {
    return "Due tomorrow";
  }

  return `Due in ${diffDays} days`;
};

export const RecoveriesBoard = ({ transactions, onMarkReceived }: RecoveriesBoardProps) => {
  const recoveries = transactions
    .filter((transaction) => transaction.recoveryReminder?.status === "open")
    .sort((left, right) =>
      (left.recoveryReminder?.dueDate ?? "").localeCompare(right.recoveryReminder?.dueDate ?? "")
    );

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Recoveries</p>
        <h2>Money you are expecting back</h2>
      </div>

      <div className="recovery-list">
        {recoveries.length === 0 ? (
          <div className="empty-box">No active recoveries. Mark an expense as recoverable when you expect money back.</div>
        ) : (
          recoveries.map((transaction) => (
            <article className="recovery-card" key={transaction.id}>
              <div className="recovery-copy">
                <span className="recovery-pill">
                  {formatDueLabel(transaction.recoveryReminder?.dueDate ?? transaction.date)}
                </span>
                <strong>{transaction.merchant ?? "Unknown merchant"}</strong>
                <p>{transaction.note ?? transaction.description}</p>
              </div>
              <div className="recovery-meta">
                <strong>{formatCurrency(transaction.amount, "INR", "en-IN")}</strong>
                <span>{new Date(transaction.recoveryReminder?.dueDate ?? transaction.date).toLocaleDateString("en-IN")}</span>
                <button type="button" className="primary-cta" onClick={() => onMarkReceived(transaction.id)}>
                  Mark received
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

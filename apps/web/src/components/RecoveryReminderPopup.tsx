import { formatCurrency, type Transaction } from "@expenses/shared";

interface RecoveryReminderPopupProps {
  transaction: Transaction;
  onMarkReceived: (transactionId: string) => void;
  onDismiss: () => void;
}

export const RecoveryReminderPopup = ({
  transaction,
  onMarkReceived,
  onDismiss
}: RecoveryReminderPopupProps) => (
  <div className="recovery-popup">
    <div className="recovery-popup-copy">
      <p className="eyebrow">Reminder</p>
      <h2>Collect back {formatCurrency(transaction.amount, "INR", "en-IN")}</h2>
      <p className="panel-copy">
        {transaction.merchant ?? "This payment"} was marked as recoverable. If you received the money, add it
        to credits and close this reminder.
      </p>
    </div>
    <div className="recovery-popup-actions">
      <button type="button" className="secondary-button" onClick={onDismiss}>
        Later
      </button>
      <button type="button" className="primary-cta" onClick={() => onMarkReceived(transaction.id)}>
        Mark received
      </button>
    </div>
  </div>
);

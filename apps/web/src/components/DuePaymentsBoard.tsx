import { formatCurrency, type Transaction } from "@expenses/shared";

interface DuePaymentItem {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  dueLabel: string;
  status: "Upcoming" | "Monitor";
}

interface DuePaymentsBoardProps {
  transactions: Transaction[];
}

const recurringCategories = new Set(["Rent", "Bills", "Recharge", "Education"]);

const buildDuePayments = (transactions: Transaction[]): DuePaymentItem[] => {
  const recurringTransactions = transactions
    .filter((transaction) => recurringCategories.has(transaction.category))
    .sort((left, right) => right.date.localeCompare(left.date));

  const seenMerchants = new Set<string>();
  const duePayments: DuePaymentItem[] = [];

  recurringTransactions.forEach((transaction, index) => {
    const merchant = transaction.merchant ?? transaction.description;
    if (seenMerchants.has(merchant)) {
      return;
    }

    seenMerchants.add(merchant);
    duePayments.push({
      id: transaction.id,
      merchant,
      category: transaction.category,
      amount: transaction.amount,
      dueLabel: index === 0 ? "Due in 2 days" : index === 1 ? "Due this week" : "Keep on radar",
      status: index < 2 ? "Upcoming" : "Monitor"
    });
  });

  if (duePayments.length > 0) {
    return duePayments.slice(0, 4);
  }

  return [
    {
      id: "rent-template",
      merchant: "Rent",
      category: "Rent",
      amount: 0,
      dueLabel: "No recurring payments detected yet",
      status: "Monitor"
    }
  ];
};

export const DuePaymentsBoard = ({ transactions }: DuePaymentsBoardProps) => {
  const duePayments = buildDuePayments(transactions);

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Due payments</p>
        <h2>Keep recurring commitments visible</h2>
      </div>

      <div className="due-grid">
        {duePayments.map((payment) => (
          <article className="due-card" key={payment.id}>
            <span className={`due-pill due-${payment.status.toLowerCase()}`}>{payment.status}</span>
            <strong>{payment.merchant}</strong>
            <p>
              {payment.category} {payment.amount > 0 ? `• ${formatCurrency(payment.amount, "INR", "en-IN")}` : ""}
            </p>
            <span>{payment.dueLabel}</span>
          </article>
        ))}
      </div>
    </section>
  );
};

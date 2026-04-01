import { formatCurrency, type Expense } from "@expenses/shared";

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => (
  <section className="panel">
    <div className="section-heading">
      <p className="eyebrow">Recent entries</p>
      <h2>Every purchase in one place</h2>
    </div>

    <div className="expense-list">
      {expenses.map((expense) => (
        <article className="expense-row" key={expense.id}>
          <div>
            <strong>{expense.title}</strong>
            <p>
              {expense.category} • {expense.date}
            </p>
            {expense.note ? <span>{expense.note}</span> : null}
          </div>
          <strong>{formatCurrency(expense.amount)}</strong>
        </article>
      ))}
    </div>
  </section>
);

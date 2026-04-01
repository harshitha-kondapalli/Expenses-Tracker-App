import { formatCurrency } from "@expenses/shared";
import { CategoryBreakdown } from "./components/CategoryBreakdown";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExpenseList } from "./components/ExpenseList";
import { SummaryCard } from "./components/SummaryCard";
import { useExpenses } from "./hooks/useExpenses";

const App = () => {
  const { expenses, summary, addExpense } = useExpenses();

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Expense tracker</p>
          <h1>Track your expenses across web and mobile.</h1>
          <p className="hero-copy">
            Capture every purchase, monitor monthly spending, and build better habits with a simple dashboard.
          </p>
        </div>

        <div className="summary-grid">
          <SummaryCard
            label="Total spent"
            value={formatCurrency(summary.totalSpent)}
            helper="All recorded expenses"
          />
          <SummaryCard
            label="This month"
            value={formatCurrency(summary.monthlySpent)}
            helper="Current month spending"
          />
          <SummaryCard
            label="Transactions"
            value={String(expenses.length)}
            helper="Tracked purchases"
          />
        </div>
      </section>

      <section className="content-grid">
        <ExpenseForm onSubmit={addExpense} />
        <CategoryBreakdown totals={summary.categoryTotals} />
      </section>

      <ExpenseList expenses={summary.recentExpenses} />
    </main>
  );
};

export default App;

import { expenseCategories, formatCurrency, type ExpenseCategory } from "@expenses/shared";

interface CategoryBreakdownProps {
  totals: Record<ExpenseCategory, number>;
}

export const CategoryBreakdown = ({ totals }: CategoryBreakdownProps) => (
  <section className="panel">
    <div className="section-heading">
      <p className="eyebrow">Categories</p>
      <h2>See where your money goes</h2>
    </div>

    <div className="category-list">
      {expenseCategories.map((category) => (
        <div className="category-row" key={category}>
          <span>{category}</span>
          <strong>{formatCurrency(totals[category])}</strong>
        </div>
      ))}
    </div>
  </section>
);

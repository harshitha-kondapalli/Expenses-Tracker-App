import { expenseCategories, formatCurrency, type ExpenseCategory } from "@expenses/shared";

interface CategoryBreakdownProps {
  totals: Record<ExpenseCategory, number>;
  activeCategory?: string;
  onSelectCategory?: (category: ExpenseCategory) => void;
}

export const CategoryBreakdown = ({ totals, activeCategory, onSelectCategory }: CategoryBreakdownProps) => {
  const peak = Math.max(...expenseCategories.map((category) => totals[category]), 0);

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Categories</p>
        <h2>See where your money goes</h2>
      </div>

      <div className="category-list">
        {expenseCategories.map((category) => {
          const width = peak === 0 ? 0 : (totals[category] / peak) * 100;
          const isActive = activeCategory === category;

          return (
            <button
              type="button"
              className={isActive ? "category-block category-block-active" : "category-block"}
              key={category}
              onClick={() => onSelectCategory?.(category)}
            >
              <div className="category-copy">
                <span>{category}</span>
                <strong>{formatCurrency(totals[category], "INR", "en-IN")}</strong>
              </div>
              <div className="category-track">
                <div className="category-fill" style={{ width: `${width}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

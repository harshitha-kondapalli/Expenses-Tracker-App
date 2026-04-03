import { expenseCategories, paymentMethods } from "@expenses/shared";

export interface DashboardFilters {
  query: string;
  category: string;
  paymentMethod: string;
  dateWindow: "7d" | "30d" | "90d" | "all";
}

interface FiltersBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
}

export const FiltersBar = ({ filters, onChange }: FiltersBarProps) => (
  <section className="panel filters-panel">
    <div className="filters-header">
      <div className="section-heading">
        <p className="eyebrow">Filter view</p>
        <h2>Refine what you are looking at</h2>
      </div>
      <button
        type="button"
        className="filters-reset"
        onClick={() =>
          onChange({
            query: "",
            category: "all",
            paymentMethod: "all",
            dateWindow: "30d"
          })
        }
      >
        Reset
      </button>
    </div>

    <div className="filters-grid">
      <label className="filter-control filter-search">
        <span>Search</span>
        <input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Merchant, note, amount..."
        />
      </label>

      <label className="filter-control">
        <span>Category</span>
        <select
          value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value })}
        >
          <option value="all">All categories</option>
          {expenseCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-control">
        <span>Method</span>
        <select
          value={filters.paymentMethod}
          onChange={(event) => onChange({ ...filters, paymentMethod: event.target.value })}
        >
          <option value="all">All methods</option>
          {paymentMethods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-control">
        <span>Window</span>
        <select
          value={filters.dateWindow}
          onChange={(event) =>
            onChange({
              ...filters,
              dateWindow: event.target.value as DashboardFilters["dateWindow"]
            })
          }
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </label>
    </div>
  </section>
);

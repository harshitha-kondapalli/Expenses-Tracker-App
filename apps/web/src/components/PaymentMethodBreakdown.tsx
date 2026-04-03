import { formatCurrency, paymentMethods, type PaymentMethod } from "@expenses/shared";

interface PaymentMethodBreakdownProps {
  totals: Record<PaymentMethod, number>;
}

export const PaymentMethodBreakdown = ({ totals }: PaymentMethodBreakdownProps) => {
  const totalSpent = paymentMethods.reduce((sum, method) => sum + totals[method], 0);
  const rankedMethods = paymentMethods
    .map((method) => ({
      method,
      amount: totals[method],
      share: totalSpent === 0 ? 0 : (totals[method] / totalSpent) * 100
    }))
    .sort((left, right) => right.amount - left.amount);

  const leadMethod = rankedMethods[0];
  const donutStops = rankedMethods.reduce<string[]>((stops, entry, index) => {
    const previousStop = stops.length === 0 ? 0 : Number(stops[stops.length - 1].split(" ")[1].replace("%", ""));
    const nextStop = previousStop + entry.share;
    const color = ["#132238", "#d26c35", "#2f8f65", "#1a6bc0", "#c27f2a", "#7b8ba1"][index] ?? "#9aa8b8";
    stops.push(`${color} ${previousStop}% ${nextStop}%`);
    return stops;
  }, []);

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Payment mix</p>
        <h2>How outgoing spend is split across methods</h2>
      </div>

      <div className="payment-mix-layout">
        <div className="payment-mix-hero">
          <div
            className="payment-donut"
            style={{
              background:
                totalSpent === 0
                  ? "linear-gradient(180deg, rgba(19, 34, 56, 0.08), rgba(19, 34, 56, 0.16))"
                  : `conic-gradient(${donutStops.join(", ")})`
            }}
          >
            <div className="payment-donut-center">
              <span>Total</span>
              <strong>{formatCurrency(totalSpent, "INR", "en-IN")}</strong>
            </div>
          </div>

          <div className="payment-mix-summary">
            <p>Lead method</p>
            <strong>{leadMethod?.method ?? "No spend yet"}</strong>
            <span>
              {totalSpent === 0
                ? "Add expenses to see the split."
                : `${leadMethod.share.toFixed(1)}% of outgoing spend`}
            </span>
          </div>
        </div>

        <div className="payment-mix-list">
          {rankedMethods.map((entry, index) => {
            const color = ["#132238", "#d26c35", "#2f8f65", "#1a6bc0", "#c27f2a", "#7b8ba1"][index] ?? "#9aa8b8";

            return (
              <div className="payment-mix-row" key={entry.method}>
                <div className="payment-mix-copy">
                  <div className="payment-mix-label">
                    <span className="payment-dot" style={{ backgroundColor: color }} />
                    <strong>{entry.method}</strong>
                  </div>
                  <span>{entry.share.toFixed(1)}%</span>
                </div>
                <div className="payment-mix-track">
                  <div
                    className="payment-mix-fill"
                    style={{ width: `${entry.share}%`, backgroundColor: color }}
                  />
                </div>
                <div className="payment-mix-meta">
                  <span>{formatCurrency(entry.amount, "INR", "en-IN")}</span>
                  <span>{entry.amount === 0 ? "No spend" : "Of filtered total"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

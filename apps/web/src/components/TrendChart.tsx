import { formatCurrency, type SpendingTrendPoint } from "@expenses/shared";

interface TrendChartProps {
  title: string;
  subtitle: string;
  points: SpendingTrendPoint[];
}

export const TrendChart = ({ title, subtitle, points }: TrendChartProps) => {
  const peak = points.reduce((max, point) => Math.max(max, point.total), 0);

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Trends</p>
        <h2>{title}</h2>
      </div>
      <p className="panel-copy">{subtitle}</p>

      <div className="trend-chart">
        {points.length === 0 ? (
          <div className="empty-box">No trend data for the selected filter.</div>
        ) : (
          points.map((point) => {
            const height = peak === 0 ? 0 : Math.max((point.total / peak) * 100, 12);

            return (
              <div className="trend-column" key={point.label}>
                <span>{point.label.slice(5)}</span>
                <div className="trend-bar-wrap">
                  <div className="trend-bar" style={{ height: `${height}%` }} />
                </div>
                <strong>{formatCurrency(point.total, "INR", "en-IN")}</strong>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

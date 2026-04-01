interface SummaryCardProps {
  label: string;
  value: string;
  helper: string;
}

export const SummaryCard = ({ label, value, helper }: SummaryCardProps) => (
  <article className="summary-card">
    <p>{label}</p>
    <strong>{value}</strong>
    <span>{helper}</span>
  </article>
);

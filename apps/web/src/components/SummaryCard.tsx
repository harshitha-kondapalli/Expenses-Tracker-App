interface SummaryCardProps {
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "accent";
}

export const SummaryCard = ({ label, value, helper, tone = "default" }: SummaryCardProps) => (
  <article className={`summary-card summary-${tone}`}>
    <p>{label}</p>
    <strong>{value}</strong>
    <span>{helper}</span>
  </article>
);

import { percent } from "@/lib/format";

interface ProgressBarProps {
  value: number;
  total: number;
  label?: string;
}

export function ProgressBar({ value, total, label }: ProgressBarProps) {
  const complete = total > 0 && value >= total;
  return (
    <div
      className={`bar${complete ? " done" : ""}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
    >
      <span style={{ width: `${percent(value, total)}%` }} />
    </div>
  );
}

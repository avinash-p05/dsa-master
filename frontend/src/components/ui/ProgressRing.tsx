import { percent } from "@/lib/format";

const RADIUS = 63;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ value, total }: { value: number; total: number }) {
  const offset = CIRCUMFERENCE * (1 - (total ? value / total : 0));
  return (
    <div className="ring">
      <svg viewBox="0 0 150 150" aria-hidden="true">
        <circle className="track" cx="75" cy="75" r={RADIUS} />
        <circle
          className="value"
          cx="75"
          cy="75"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-label">
        <div>
          <strong>{percent(value, total)}%</strong>
          <span>
            {value} / {total} solved
          </span>
        </div>
      </div>
    </div>
  );
}

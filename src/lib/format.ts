import { DAY_MS } from "./review";

export const percent = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function relativeDay(timestamp: number, now: number = Date.now()): string {
  const days = Math.round((timestamp - now) / DAY_MS);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

export const todayIso = () => new Date().toISOString().slice(0, 10);

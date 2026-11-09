import type { SolvedEntry } from "@/types/progress";

export const DAY_MS = 86_400_000;

/** Revisit a solved problem 2, 7 and 14 days after first solving it. */
export const REVIEW_OFFSETS_DAYS = [2, 7, 14] as const;
export const REVIEW_STAGES = REVIEW_OFFSETS_DAYS.length;

/**
 * When the next review is due, or null if the problem is unsolved or mastered.
 * Each gap is measured from the previous review, so reviewing late never makes
 * the next review due immediately.
 */
export function nextReviewAt(entry: SolvedEntry | undefined): number | null {
  if (!entry || entry.stage >= REVIEW_STAGES) return null;
  const offset = REVIEW_OFFSETS_DAYS[entry.stage] ?? 0;
  const previous = entry.stage > 0 ? (REVIEW_OFFSETS_DAYS[entry.stage - 1] ?? 0) : 0;
  return (entry.last ?? entry.at) + (offset - previous) * DAY_MS;
}

export function isReviewDue(entry: SolvedEntry | undefined, now: number): boolean {
  const due = nextReviewAt(entry);
  return due !== null && due <= now;
}

export function isMastered(entry: SolvedEntry | undefined): boolean {
  return !!entry && entry.stage >= REVIEW_STAGES;
}

export function completeReview(entry: SolvedEntry, now: number): SolvedEntry {
  return { ...entry, stage: Math.min(entry.stage + 1, REVIEW_STAGES), last: now };
}

export interface SolvedEntry {
  /** Epoch ms when first marked solved. */
  at: number;
  /** Number of completed spaced reviews (0..REVIEW_OFFSETS.length). */
  stage: number;
  /** Epoch ms of the last completed review, or null. */
  last: number | null;
}

export type StatusFilter = "all" | "todo" | "done";
export type DifficultyFilter = "all" | "E" | "M" | "H";

export interface ProblemFilter {
  status: StatusFilter;
  difficulty: DifficultyFilter;
}

export type Theme = "light" | "dark";

/** Everything persisted to localStorage. */
export interface ProgressState {
  version: 1;
  solved: Record<number, SolvedEntry>;
  flagged: Record<number, true>;
  notes: Record<number, string>;
  /** Topic slugs whose concept panel is collapsed. */
  collapsed: Record<string, true>;
  filter: ProblemFilter;
  theme?: Theme;
}

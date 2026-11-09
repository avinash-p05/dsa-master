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

/**
 * Everything the app tracks. Progress maps are keyed by LeetCode slug so they
 * stay correct if problems are added or reordered.
 */
export interface ProgressState {
  version: 2;
  solved: Record<string, SolvedEntry>;
  flagged: Record<string, true>;
  notes: Record<string, string>;
  /** Topic slugs whose concept panel is collapsed. */
  collapsed: Record<string, true>;
  filter: ProblemFilter;
  theme?: Theme;
}

/** The per-problem slice of ProgressState. */
export interface ProblemState {
  solved?: SolvedEntry;
  flagged: boolean;
  note: string;
}

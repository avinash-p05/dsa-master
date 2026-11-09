import { createContext } from "react";
import type { Problem } from "@/types/roadmap";
import type { ProblemFilter, ProgressState, SolvedEntry, Theme } from "@/types/progress";

export interface ProgressContextValue {
  state: ProgressState;
  /** Current time, refreshed when the tab regains focus so "due" states stay correct. */
  now: number;
  /** True when progress is stored in the signed-in user's account. */
  isCloud: boolean;
  /** True while the account's progress is being loaded or merged. */
  syncing: boolean;

  getSolved: (slug: string) => SolvedEntry | undefined;
  isSolved: (slug: string) => boolean;
  countSolved: (problems: readonly Problem[]) => number;
  dueProblems: readonly Problem[];

  /** Returns true if the problem is now solved. */
  toggleSolved: (slug: string) => boolean;
  markReviewed: (slug: string) => void;
  toggleFlag: (slug: string) => void;
  setNote: (slug: string, text: string) => void;
  toggleConceptCollapsed: (topicSlug: string) => void;
  setFilter: (patch: Partial<ProblemFilter>) => void;
  setTheme: (theme: Theme) => void;
  /** Import progress (from an export file). Merged into the account when signed in. */
  importProgress: (imported: ProgressState) => Promise<void>;
  resetProgress: () => Promise<void>;
}

export const ProgressContext = createContext<ProgressContextValue | null>(null);

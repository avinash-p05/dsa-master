import { createContext } from "react";
import type { Problem } from "@/types/roadmap";
import type { ProblemFilter, ProgressState, SolvedEntry, Theme } from "@/types/progress";

export interface ProgressContextValue {
  state: ProgressState;
  /** Current time, refreshed when the tab regains focus so "due" states stay correct. */
  now: number;

  getSolved: (id: number) => SolvedEntry | undefined;
  isSolved: (id: number) => boolean;
  countSolved: (problems: readonly Problem[]) => number;
  dueProblems: readonly Problem[];

  /** Returns true if the problem is now solved. */
  toggleSolved: (id: number) => boolean;
  markReviewed: (id: number) => void;
  toggleFlag: (id: number) => void;
  setNote: (id: number, text: string) => void;
  toggleConceptCollapsed: (slug: string) => void;
  setFilter: (patch: Partial<ProblemFilter>) => void;
  setTheme: (theme: Theme) => void;
  replaceState: (next: ProgressState) => void;
  resetProgress: () => void;
}

export const ProgressContext = createContext<ProgressContextValue | null>(null);

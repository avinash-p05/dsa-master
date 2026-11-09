import type { ProgressEntryDto } from "@/lib/api";
import type { ProblemState, ProgressState } from "@/types/progress";

/** Pure helpers for reading/writing one problem's slice and converting to/from API entries. */

export function getProblemState(state: ProgressState, slug: string): ProblemState {
  return { solved: state.solved[slug], flagged: !!state.flagged[slug], note: state.notes[slug] ?? "" };
}

export function setProblemState(state: ProgressState, slug: string, next: ProblemState): ProgressState {
  const solved = { ...state.solved };
  const flagged = { ...state.flagged };
  const notes = { ...state.notes };

  if (next.solved) solved[slug] = next.solved;
  else delete solved[slug];
  if (next.flagged) flagged[slug] = true;
  else delete flagged[slug];
  if (next.note.trim()) notes[slug] = next.note;
  else delete notes[slug];

  return { ...state, solved, flagged, notes };
}

export function toEntry(slug: string, p: ProblemState): ProgressEntryDto {
  return {
    slug,
    solvedAt: p.solved?.at ?? null,
    reviewStage: p.solved?.stage ?? 0,
    lastReviewedAt: p.solved?.last ?? null,
    flagged: p.flagged,
    note: p.note.trim() ? p.note : null,
  };
}

/** Every problem with any progress, flag or note. */
export function toEntries(state: ProgressState): ProgressEntryDto[] {
  const slugs = new Set([...Object.keys(state.solved), ...Object.keys(state.flagged), ...Object.keys(state.notes)]);
  return [...slugs].map((slug) => toEntry(slug, getProblemState(state, slug)));
}

/** Replace the progress maps with server data, keeping device preferences. */
export function withEntries(state: ProgressState, entries: readonly ProgressEntryDto[]): ProgressState {
  const next: ProgressState = { ...state, solved: {}, flagged: {}, notes: {} };
  for (const e of entries) {
    if (e.solvedAt !== null) next.solved[e.slug] = { at: e.solvedAt, stage: e.reviewStage, last: e.lastReviewedAt };
    if (e.flagged) next.flagged[e.slug] = true;
    if (e.note) next.notes[e.slug] = e.note;
  }
  return next;
}

export const withoutProgress = (state: ProgressState): ProgressState => ({
  ...state,
  solved: {},
  flagged: {},
  notes: {},
});

export const hasProgress = (state: ProgressState) =>
  Object.keys(state.solved).length + Object.keys(state.flagged).length + Object.keys(state.notes).length > 0;

import type { ProblemFilter, ProgressState, SolvedEntry } from "@/types/progress";

export const STORAGE_KEY = "dsa-master-v1";

export const createEmptyState = (): ProgressState => ({
  version: 1,
  solved: {},
  flagged: {},
  notes: {},
  collapsed: {},
  filter: { status: "all", difficulty: "all" },
});

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function normalizeFilter(raw: unknown): ProblemFilter {
  const base = createEmptyState().filter;
  if (!isObject(raw)) return base;
  const status = raw.status;
  const difficulty = raw.difficulty ?? raw.diff; // `diff` was used by the pre-React version
  return {
    status: status === "todo" || status === "done" ? status : "all",
    difficulty: difficulty === "E" || difficulty === "M" || difficulty === "H" ? difficulty : base.difficulty,
  };
}

function normalizeSolved(raw: unknown): Record<number, SolvedEntry> {
  const out: Record<number, SolvedEntry> = {};
  if (!isObject(raw)) return out;
  for (const [key, value] of Object.entries(raw)) {
    if (!isObject(value) || typeof value.at !== "number") continue;
    out[Number(key)] = {
      at: value.at,
      stage: typeof value.stage === "number" ? value.stage : 0,
      last: typeof value.last === "number" ? value.last : null,
    };
  }
  return out;
}

/** Coerce unknown JSON (from storage or an imported file) into a valid state. Returns null if unusable. */
export function parseState(raw: unknown): ProgressState | null {
  if (!isObject(raw) || !isObject(raw.solved)) return null;
  const empty = createEmptyState();
  return {
    ...empty,
    solved: normalizeSolved(raw.solved),
    flagged: isObject(raw.flagged) ? (raw.flagged as ProgressState["flagged"]) : {},
    notes: isObject(raw.notes) ? (raw.notes as ProgressState["notes"]) : {},
    collapsed: isObject(raw.collapsed) ? (raw.collapsed as ProgressState["collapsed"]) : {},
    filter: normalizeFilter(raw.filter),
    theme: raw.theme === "light" || raw.theme === "dark" ? raw.theme : undefined,
  };
}

export function loadState(): ProgressState {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return parseState(raw) ?? createEmptyState();
  } catch {
    return createEmptyState();
  }
}

/** Returns false if the browser refused to store the data. */
export function saveState(state: ProgressState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

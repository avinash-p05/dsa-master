import { PROBLEMS } from "@/data";
import type { ProblemFilter, ProgressState, SolvedEntry } from "@/types/progress";

export const STORAGE_KEY = "dsa-master-v1";

export const createEmptyState = (): ProgressState => ({
  version: 2,
  solved: {},
  flagged: {},
  notes: {},
  collapsed: {},
  filter: { status: "all", difficulty: "all" },
});

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/**
 * Version 1 keyed progress by problem number (1–180). Map those keys to
 * slugs; anything else is assumed to already be a slug.
 */
function toSlugKey(key: string): string | undefined {
  if (/^\d+$/.test(key)) return PROBLEMS[Number(key) - 1]?.slug;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key) ? key : undefined;
}

function normalizeFilter(raw: unknown): ProblemFilter {
  const base = createEmptyState().filter;
  if (!isObject(raw)) return base;
  const status = raw.status;
  const difficulty = raw.difficulty ?? raw.diff; // `diff` was used by the first version
  return {
    status: status === "todo" || status === "done" ? status : "all",
    difficulty: difficulty === "E" || difficulty === "M" || difficulty === "H" ? difficulty : base.difficulty,
  };
}

function normalizeSolved(raw: unknown): Record<string, SolvedEntry> {
  const out: Record<string, SolvedEntry> = {};
  if (!isObject(raw)) return out;
  for (const [key, value] of Object.entries(raw)) {
    const slug = toSlugKey(key);
    if (!slug || !isObject(value) || typeof value.at !== "number") continue;
    out[slug] = {
      at: value.at,
      stage: typeof value.stage === "number" ? value.stage : 0,
      last: typeof value.last === "number" ? value.last : null,
    };
  }
  return out;
}

function normalizeFlags(raw: unknown): Record<string, true> {
  const out: Record<string, true> = {};
  if (!isObject(raw)) return out;
  for (const [key, value] of Object.entries(raw)) {
    const slug = toSlugKey(key);
    if (slug && value) out[slug] = true;
  }
  return out;
}

function normalizeNotes(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!isObject(raw)) return out;
  for (const [key, value] of Object.entries(raw)) {
    const slug = toSlugKey(key);
    if (slug && typeof value === "string" && value.trim()) out[slug] = value;
  }
  return out;
}

/** Coerce unknown JSON (from storage or an imported file) into a valid state. Returns null if unusable. */
export function parseState(raw: unknown): ProgressState | null {
  if (!isObject(raw) || !isObject(raw.solved)) return null;
  const collapsed: Record<string, true> = {};
  if (isObject(raw.collapsed)) {
    for (const [k, v] of Object.entries(raw.collapsed)) if (v) collapsed[k] = true;
  }
  return {
    ...createEmptyState(),
    solved: normalizeSolved(raw.solved),
    flagged: normalizeFlags(raw.flagged),
    notes: normalizeNotes(raw.notes),
    collapsed,
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

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PROBLEMS } from "@/data";
import { useToast } from "@/hooks/useToast";
import { completeReview, isReviewDue } from "@/lib/review";
import { STORAGE_KEY, createEmptyState, loadState, saveState } from "@/lib/storage";
import type { ProgressState } from "@/types/progress";
import { ProgressContext, type ProgressContextValue } from "./progressContext";

const SAVE_DEBOUNCE_MS = 250;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(loadState);
  const [now, setNow] = useState(() => Date.now());
  const toast = useToast();
  const skipNextSave = useRef(false);

  // Persist (debounced so typing notes doesn't hammer localStorage).
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (!saveState(state)) toast("Couldn't save. Browser storage may be blocked or full.");
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state, toast]);

  // Apply the theme to <html>.
  useEffect(() => {
    if (state.theme) document.documentElement.dataset.theme = state.theme;
    else delete document.documentElement.dataset.theme;
  }, [state.theme]);

  // Keep multiple tabs in sync and refresh "now" when the user comes back.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      skipNextSave.current = true;
      setState(loadState());
    };
    const onVisible = () => {
      if (!document.hidden) setNow(Date.now());
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const toggleSolved = useCallback((id: number) => {
    const willBeSolved = !state.solved[id];
    setState((s) => {
      const solved = { ...s.solved };
      if (solved[id]) delete solved[id];
      else solved[id] = { at: Date.now(), stage: 0, last: null };
      return { ...s, solved };
    });
    setNow(Date.now());
    return willBeSolved;
  }, [state.solved]);

  const markReviewed = useCallback((id: number) => {
    const at = Date.now();
    setState((s) => {
      const entry = s.solved[id];
      if (!entry) return s;
      return { ...s, solved: { ...s.solved, [id]: completeReview(entry, at) } };
    });
    setNow(at);
  }, []);

  const toggleFlag = useCallback((id: number) => {
    setState((s) => {
      const flagged = { ...s.flagged };
      if (flagged[id]) delete flagged[id];
      else flagged[id] = true;
      return { ...s, flagged };
    });
  }, []);

  const setNote = useCallback((id: number, text: string) => {
    setState((s) => {
      const notes = { ...s.notes };
      if (text.trim()) notes[id] = text;
      else delete notes[id];
      return { ...s, notes };
    });
  }, []);

  const toggleConceptCollapsed = useCallback((slug: string) => {
    setState((s) => {
      const collapsed = { ...s.collapsed };
      if (collapsed[slug]) delete collapsed[slug];
      else collapsed[slug] = true;
      return { ...s, collapsed };
    });
  }, []);

  const setFilter = useCallback<ProgressContextValue["setFilter"]>((patch) => {
    setState((s) => ({ ...s, filter: { ...s.filter, ...patch } }));
  }, []);

  const setTheme = useCallback<ProgressContextValue["setTheme"]>((theme) => {
    setState((s) => ({ ...s, theme }));
  }, []);

  // Import/reset keep the current theme: it's a device preference, not progress.
  const replaceState = useCallback<ProgressContextValue["replaceState"]>((next) => {
    setState((s) => ({ ...next, theme: s.theme }));
  }, []);

  const resetProgress = useCallback(() => {
    setState((s) => ({ ...createEmptyState(), theme: s.theme }));
  }, []);

  const value = useMemo<ProgressContextValue>(() => {
    const getSolved = (id: number) => state.solved[id];
    const isSolved = (id: number) => !!state.solved[id];
    return {
      state,
      now,
      getSolved,
      isSolved,
      countSolved: (problems) => problems.reduce((n, p) => n + (state.solved[p.id] ? 1 : 0), 0),
      dueProblems: PROBLEMS.filter((p) => isReviewDue(state.solved[p.id], now)),
      toggleSolved,
      markReviewed,
      toggleFlag,
      setNote,
      toggleConceptCollapsed,
      setFilter,
      setTheme,
      replaceState,
      resetProgress,
    };
  }, [
    state,
    now,
    toggleSolved,
    markReviewed,
    toggleFlag,
    setNote,
    toggleConceptCollapsed,
    setFilter,
    setTheme,
    replaceState,
    resetProgress,
  ]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PROBLEMS } from "@/data";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ApiError, api } from "@/lib/api";
import { plural } from "@/lib/format";
import {
  getProblemState,
  setProblemState,
  toEntries,
  toEntry,
  withEntries,
  withoutProgress,
} from "@/lib/progressState";
import { completeReview, isReviewDue } from "@/lib/review";
import { STORAGE_KEY, loadState, saveState } from "@/lib/storage";
import type { ProblemState, ProgressState } from "@/types/progress";
import { ProgressContext, type ProgressContextValue } from "./progressContext";

const SAVE_DEBOUNCE_MS = 250;
const NOTE_SYNC_DEBOUNCE_MS = 700;

/**
 * Owns all progress state.
 * - Signed out: everything lives in localStorage.
 * - Signed in: the server is the source of truth. Each change is applied
 *   locally right away and then PUT to /api/progress/{slug}. On sign-in, any
 *   progress made in this browser while signed out is merged into the account.
 * Device preferences (theme, filters, collapsed panels) always stay local.
 */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const toast = useToast();
  const isCloud = status === "authenticated";

  const [state, setState] = useState<ProgressState>(loadState);
  const [now, setNow] = useState(() => Date.now());
  const [syncing, setSyncing] = useState(false);

  // Event handlers read and write through this ref so rapid clicks never act
  // on a stale snapshot, and so we know exactly what to send to the server.
  const stateRef = useRef(state);
  const commit = useCallback((next: ProgressState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const pendingPushes = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const wasCloud = useRef(false);
  const skipNextSave = useRef(false);

  /* ---------- Local persistence ---------- */

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timer = setTimeout(() => {
      // When signed in, progress lives on the server; keep only device prefs locally.
      if (!saveState(isCloud ? withoutProgress(state) : state)) {
        toast("Couldn't save. Browser storage may be blocked or full.");
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state, isCloud, toast]);

  useEffect(() => {
    if (state.theme) document.documentElement.dataset.theme = state.theme;
    else delete document.documentElement.dataset.theme;
  }, [state.theme]);

  /* ---------- Account sync ---------- */

  const loadFromServer = useCallback(async () => {
    const res = await api.listProgress();
    commit(withEntries(stateRef.current, res.problems));
  }, [commit]);

  const userId = user?.id;
  useEffect(() => {
    if (status === "loading") return;

    if (status === "guest") {
      if (wasCloud.current) {
        // Just signed out: don't leave the account's progress on screen.
        wasCloud.current = false;
        pendingPushes.current.forEach(clearTimeout);
        pendingPushes.current.clear();
        commit(withoutProgress(stateRef.current));
      }
      return;
    }

    wasCloud.current = true;
    let cancelled = false;
    const local = toEntries(stateRef.current); // progress made while signed out
    setSyncing(true);

    (local.length ? api.mergeProgress(local) : api.listProgress())
      .then((res) => {
        if (cancelled) return;
        commit(withEntries(stateRef.current, res.problems));
        if (local.length) toast(`Saved ${plural(local.length, "problem")} from this browser to your account.`);
      })
      .catch(() => {
        if (!cancelled) toast("Couldn't load your progress from the server.");
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, userId, commit, toast]);

  const reportSyncError = useCallback(
    (err: unknown) => {
      toast(
        err instanceof ApiError && err.status === 401
          ? "Your session expired. Sign in again to keep saving."
          : "Couldn't save to your account. Check your connection.",
      );
    },
    [toast],
  );

  /** Send the latest state of one problem to the server (debounced per problem). */
  const pushProblem = useCallback(
    (slug: string, delay: number) => {
      if (!isCloud) return;
      const timers = pendingPushes.current;
      const existing = timers.get(slug);
      if (existing) clearTimeout(existing);
      timers.set(
        slug,
        setTimeout(() => {
          timers.delete(slug);
          api.putProgress(toEntry(slug, getProblemState(stateRef.current, slug))).catch(reportSyncError);
        }, delay),
      );
    },
    [isCloud, reportSyncError],
  );

  const changeProblem = useCallback(
    (slug: string, change: (p: ProblemState) => ProblemState, syncDelay = 0) => {
      const current = getProblemState(stateRef.current, slug);
      commit(setProblemState(stateRef.current, slug, change(current)));
      pushProblem(slug, syncDelay);
    },
    [commit, pushProblem],
  );

  /* ---------- Cross-tab / returning-user refresh ---------- */

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || isCloud) return;
      skipNextSave.current = true;
      commit(loadState());
    };
    const onVisible = () => {
      if (document.hidden) return;
      setNow(Date.now());
      // Pick up changes made on another device.
      if (isCloud && pendingPushes.current.size === 0) loadFromServer().catch(() => undefined);
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isCloud, commit, loadFromServer]);

  /* ---------- Actions ---------- */

  const toggleSolved = useCallback(
    (slug: string) => {
      const willBeSolved = !stateRef.current.solved[slug];
      changeProblem(slug, (p) => ({
        ...p,
        solved: willBeSolved ? { at: Date.now(), stage: 0, last: null } : undefined,
      }));
      setNow(Date.now());
      return willBeSolved;
    },
    [changeProblem],
  );

  const markReviewed = useCallback(
    (slug: string) => {
      const at = Date.now();
      changeProblem(slug, (p) => (p.solved ? { ...p, solved: completeReview(p.solved, at) } : p));
      setNow(at);
    },
    [changeProblem],
  );

  const toggleFlag = useCallback(
    (slug: string) => changeProblem(slug, (p) => ({ ...p, flagged: !p.flagged })),
    [changeProblem],
  );

  const setNote = useCallback(
    (slug: string, text: string) => changeProblem(slug, (p) => ({ ...p, note: text }), NOTE_SYNC_DEBOUNCE_MS),
    [changeProblem],
  );

  const updatePrefs = useCallback(
    (change: (s: ProgressState) => ProgressState) => commit(change(stateRef.current)),
    [commit],
  );

  const toggleConceptCollapsed = useCallback(
    (topicSlug: string) =>
      updatePrefs((s) => {
        const collapsed = { ...s.collapsed };
        if (collapsed[topicSlug]) delete collapsed[topicSlug];
        else collapsed[topicSlug] = true;
        return { ...s, collapsed };
      }),
    [updatePrefs],
  );

  const setFilter = useCallback<ProgressContextValue["setFilter"]>(
    (patch) => updatePrefs((s) => ({ ...s, filter: { ...s.filter, ...patch } })),
    [updatePrefs],
  );

  const setTheme = useCallback<ProgressContextValue["setTheme"]>(
    (theme) => updatePrefs((s) => ({ ...s, theme })),
    [updatePrefs],
  );

  const importProgress = useCallback<ProgressContextValue["importProgress"]>(
    async (imported) => {
      if (isCloud) {
        const res = await api.mergeProgress(toEntries(imported));
        commit(withEntries(stateRef.current, res.problems));
      } else {
        // Keep this device's preferences; take progress from the file.
        commit(withEntries(stateRef.current, toEntries(imported)));
      }
    },
    [isCloud, commit],
  );

  const resetProgress = useCallback(async () => {
    pendingPushes.current.forEach(clearTimeout);
    pendingPushes.current.clear();
    if (isCloud) await api.resetProgress();
    commit(withoutProgress(stateRef.current));
  }, [isCloud, commit]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      now,
      isCloud,
      syncing,
      getSolved: (slug) => state.solved[slug],
      isSolved: (slug) => !!state.solved[slug],
      countSolved: (problems) => problems.reduce((n, p) => n + (state.solved[p.slug] ? 1 : 0), 0),
      dueProblems: PROBLEMS.filter((p) => isReviewDue(state.solved[p.slug], now)),
      toggleSolved,
      markReviewed,
      toggleFlag,
      setNote,
      toggleConceptCollapsed,
      setFilter,
      setTheme,
      importProgress,
      resetProgress,
    }),
    [
      state,
      now,
      isCloud,
      syncing,
      toggleSolved,
      markReviewed,
      toggleFlag,
      setNote,
      toggleConceptCollapsed,
      setFilter,
      setTheme,
      importProgress,
      resetProgress,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

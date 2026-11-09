import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PHASES, PROBLEMS, TOPICS, TOTAL_PROBLEMS } from "@/data";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "@/hooks/useProgress";
import { DAY_MS } from "@/lib/review";
import { plural } from "@/lib/format";
import type { Difficulty } from "@/types/roadmap";
import { ProblemList } from "@/components/problems/ProblemList";
import { TopicCard } from "@/components/topics/TopicCard";
import { DifficultyDot } from "@/components/ui/DifficultyPill";
import { Icon } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";

const DIFFICULTY_STATS: { key: Difficulty; label: string }[] = [
  { key: "E", label: "Easy" },
  { key: "M", label: "Medium" },
  { key: "H", label: "Hard" },
];

/** Nudges guests to sign in. Hidden when no backend/providers are available. */
function SyncBanner() {
  const { status, providers, openAuthDialog } = useAuth();
  const { syncing } = useProgress();

  if (syncing) {
    return (
      <div className="card banner">
        <Icon name="cloud" className="banner-icon" />
        <span>Syncing your progress…</span>
      </div>
    );
  }
  if (status !== "guest" || providers.length === 0) return null;
  return (
    <div className="card banner">
      <Icon name="cloud" className="banner-icon" />
      <div className="banner-text">
        <strong>Your progress is only saved in this browser.</strong>
        <span className="muted"> Sign in to keep it across devices. Anything you've already ticked comes with you.</span>
      </div>
      <div className="banner-actions">
        <button type="button" className="btn btn-sm" onClick={() => openAuthDialog("signin")}>
          Sign in
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => openAuthDialog("signup")}>
          Create account
        </button>
      </div>
    </div>
  );
}

export function HomePage() {
  const { state, now, isSolved, countSolved, dueProblems } = useProgress();
  const [query, setQuery] = useState("");

  const solved = countSolved(PROBLEMS);
  const next = PROBLEMS.find((p) => !isSolved(p.slug));
  const solvedThisWeek = Object.values(state.solved).filter((s) => s.at >= now - 7 * DAY_MS).length;
  const topicsComplete = TOPICS.filter((t) => countSolved(t.problems) === t.problems.length).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return PROBLEMS.filter(
      (p) => p.title.toLowerCase().includes(q) || p.topic.name.toLowerCase().includes(q) || String(p.id) === q,
    );
  }, [query]);

  return (
    <>
      <section className="card hero">
        <div>
          <div className="eyebrow">Mid-level interview roadmap</div>
          <h1>180 problems, organised by pattern</h1>
          <p>
            Work through the topics in order. Read each concept first, then solve its problems on LeetCode and tick
            them off here. Solved problems come back for review after 2, 7 and 14 days, so the patterns stick.
          </p>
          <div className="hero-actions">
            {next ? (
              <Link className="btn btn-primary" to={`/topic/${next.topic.slug}/${next.id}`}>
                {solved ? "Continue" : "Start"}: {next.title}
              </Link>
            ) : (
              <span className="btn btn-primary">All {TOTAL_PROBLEMS} solved 🎉</span>
            )}
            {dueProblems.length > 0 && (
              <Link className="btn" to="/review">
                {dueProblems.length} due for review
              </Link>
            )}
          </div>
        </div>
        <ProgressRing value={solved} total={TOTAL_PROBLEMS} />
      </section>

      <SyncBanner />

      <div className="stats">
        {DIFFICULTY_STATS.map(({ key, label }) => {
          const all = PROBLEMS.filter((p) => p.difficulty === key);
          return (
            <div key={key} className="card stat">
              <div className="label">
                <DifficultyDot difficulty={key} />
                {label}
              </div>
              <div className="value">
                {countSolved(all)} <small>/ {all.length}</small>
              </div>
            </div>
          );
        })}
        <div className="card stat">
          <div className="label">
            <DifficultyDot difficulty="A" />
            Last 7 days
          </div>
          <div className="value">
            {solvedThisWeek}{" "}
            <small>
              solved · {topicsComplete}/{TOPICS.length} topics done
            </small>
          </div>
        </div>
      </div>

      <div className="search-row">
        <label className="search">
          <Icon name="search" />
          <input
            type="search"
            placeholder={`Search all ${TOTAL_PROBLEMS} problems…`}
            autoComplete="off"
            aria-label="Search problems"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {results ? (
        <section className="section">
          <h2>{plural(results.length, "result")}</h2>
          <ProblemList
            problems={results}
            emptyMessage="No problems match that search."
            rowProps={() => ({ showTopic: true })}
          />
        </section>
      ) : (
        PHASES.map((phase) => {
          const topics = TOPICS.filter((t) => t.phase === phase.id);
          const problems = topics.flatMap((t) => t.problems);
          return (
            <section key={phase.id} className="phase">
              <div className="phase-head">
                <h2>{phase.name}</h2>
                <span className="muted">
                  {countSolved(problems)} / {problems.length}
                </span>
              </div>
              <p className="phase-blurb">{phase.blurb}</p>
              <div className="topic-grid">
                {topics.map((t) => (
                  <TopicCard key={t.slug} topic={t} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </>
  );
}

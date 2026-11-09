import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { PHASES, TOPICS, getTopic } from "@/data";
import { useProgress } from "@/hooks/useProgress";
import type { DifficultyFilter, StatusFilter } from "@/types/progress";
import type { Difficulty } from "@/types/roadmap";
import { ProblemRow } from "@/components/problems/ProblemRow";
import { ConceptPanel } from "@/components/topics/ConceptPanel";
import { DifficultyDot } from "@/components/ui/DifficultyPill";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { NotFoundPage } from "./NotFoundPage";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "done", label: "Solved" },
] as const satisfies readonly { value: StatusFilter; label: string }[];

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "Any" },
  { value: "E", label: "Easy" },
  { value: "M", label: "Medium" },
  { value: "H", label: "Hard" },
] as const satisfies readonly { value: DifficultyFilter; label: string }[];

export function TopicPage() {
  const { slug, problemId } = useParams();
  const topic = getTopic(slug);
  const focusId = Number(problemId) || undefined;
  const { state, isSolved, countSolved, setFilter } = useProgress();
  const focusRef = useRef<HTMLDivElement>(null);

  // When linked to a specific problem, clear filters so it's visible, then scroll to it.
  useEffect(() => {
    if (!focusId) return;
    setFilter({ status: "all", difficulty: "all" });
    const frame = requestAnimationFrame(() => focusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    return () => cancelAnimationFrame(frame);
  }, [focusId, slug, setFilter]);

  useEffect(() => {
    if (topic) document.title = `${topic.name} · DSA Master`;
    return () => {
      document.title = "DSA Master – 180 Problem Roadmap";
    };
  }, [topic]);

  if (!topic) return <NotFoundPage />;

  const position = TOPICS.indexOf(topic);
  const prev = TOPICS[position - 1];
  const next = TOPICS[position + 1];
  const phase = PHASES.find((p) => p.id === topic.phase);
  const solved = countSolved(topic.problems);
  const total = topic.problems.length;
  const { status, difficulty } = state.filter;
  const countBy = (d: Difficulty) => topic.problems.filter((p) => p.difficulty === d).length;

  const visible = topic.problems.filter(
    (p) =>
      (status === "all" || (status === "done") === isSolved(p.id)) &&
      (difficulty === "all" || p.difficulty === difficulty),
  );

  return (
    <>
      <div className="crumbs">
        <Link to="/">Roadmap</Link> / {phase?.name.split(" – ")[0]} / {topic.name}
      </div>

      <div className="topic-head">
        <div>
          <div className="eyebrow">
            Topic {topic.index} of {TOPICS.length}
          </div>
          <h1>{topic.name}</h1>
          <div className="sub">
            <span>
              Priority: <strong>{topic.priority}</strong>
            </span>
            <span>
              <DifficultyDot difficulty="E" /> {countBy("E")} easy
            </span>
            <span>
              <DifficultyDot difficulty="M" /> {countBy("M")} medium
            </span>
            <span>
              <DifficultyDot difficulty="H" /> {countBy("H")} hard
            </span>
          </div>
        </div>
        <div className="topic-progress">
          <div className="row">
            <span className="muted">Progress</span>
            <strong>
              {solved} / {total}
            </strong>
          </div>
          <ProgressBar value={solved} total={total} label={`${topic.name} progress`} />
        </div>
      </div>

      <ConceptPanel topic={topic} />

      <div className="toolbar">
        <h2>Problems</h2>
        <div className="filters">
          <SegmentedControl
            label="Filter by status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => setFilter({ status: v })}
          />
          <SegmentedControl
            label="Filter by difficulty"
            options={DIFFICULTY_OPTIONS}
            value={difficulty}
            onChange={(v) => setFilter({ difficulty: v })}
          />
        </div>
      </div>

      <div className="card plist">
        {visible.length ? (
          visible.map((p) => (
            <ProblemRow
              key={p.id}
              problem={p}
              ref={p.id === focusId ? focusRef : undefined}
              highlighted={p.id === focusId}
            />
          ))
        ) : (
          <div className="empty">No problems match these filters.</div>
        )}
      </div>

      <nav className="pager" aria-label="Topic navigation">
        {prev ? (
          <Link className="card" to={`/topic/${prev.slug}`}>
            <small>← Previous</small>
            {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="card next" to={`/topic/${next.slug}`}>
            <small>Next →</small>
            {next.name}
          </Link>
        ) : (
          <Link className="card next" to="/review">
            <small>Done with the roadmap?</small>
            Go to review →
          </Link>
        )}
      </nav>
    </>
  );
}

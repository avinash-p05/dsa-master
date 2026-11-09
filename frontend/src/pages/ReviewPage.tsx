import { PROBLEMS } from "@/data";
import { useProgress } from "@/hooks/useProgress";
import { relativeDay } from "@/lib/format";
import { REVIEW_STAGES, isMastered, nextReviewAt } from "@/lib/review";
import { ProblemList } from "@/components/problems/ProblemList";

const UPCOMING_LIMIT = 15;

export function ReviewPage() {
  const { state, now, dueProblems } = useProgress();

  const flagged = PROBLEMS.filter((p) => state.flagged[p.slug]);
  const mastered = PROBLEMS.filter((p) => isMastered(state.solved[p.slug])).length;
  const upcoming = PROBLEMS.map((p) => ({ problem: p, due: nextReviewAt(state.solved[p.slug]) }))
    .filter((x): x is { problem: (typeof PROBLEMS)[number]; due: number } => x.due !== null && x.due > now)
    .sort((a, b) => a.due - b.due)
    .slice(0, UPCOMING_LIMIT);
  const dueAt = new Map(upcoming.map((x) => [x.problem.id, x.due]));

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">Spaced revision</div>
        <h1>Review</h1>
        <p>
          Solve each due problem again from scratch, without looking at your old code, then press{" "}
          <strong>Reviewed</strong>. A problem counts as mastered after all three reviews (days 2, 7 and 14).
          {mastered > 0 && (
            <>
              {" "}
              You&apos;ve mastered <strong>{mastered}</strong> so far.
            </>
          )}
        </p>
      </div>

      <section className="section">
        <h2>
          Due now {dueProblems.length > 0 && <span className="badge">{dueProblems.length}</span>}
        </h2>
        <ProblemList
          problems={dueProblems}
          emptyMessage="Nothing due right now. Go solve something new."
          rowProps={(p) => ({
            showTopic: true,
            showReviewButton: true,
            extra: (
              <span className="tag">
                Review {(state.solved[p.slug]?.stage ?? 0) + 1} of {REVIEW_STAGES}
              </span>
            ),
          })}
        />
      </section>

      <section className="section">
        <h2>Flagged to revisit</h2>
        <ProblemList
          problems={flagged}
          emptyMessage="Flag a problem (the flag icon) when you got stuck or used hints. It will show up here."
          rowProps={() => ({ showTopic: true })}
        />
      </section>

      <section className="section">
        <h2>Coming up</h2>
        <ProblemList
          problems={upcoming.map((x) => x.problem)}
          emptyMessage="Nothing scheduled yet."
          rowProps={(p) => ({
            showTopic: true,
            extra: <span className="tag">due {relativeDay(dueAt.get(p.id) ?? now, now)}</span>,
          })}
        />
      </section>
    </>
  );
}

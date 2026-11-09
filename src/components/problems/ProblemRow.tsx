import { forwardRef, useState, type ReactNode } from "react";
import { leetCodeUrl } from "@/data";
import { useProgress } from "@/hooks/useProgress";
import { useToast } from "@/hooks/useToast";
import { isMastered, isReviewDue } from "@/lib/review";
import type { Problem } from "@/types/roadmap";
import { DifficultyPill } from "@/components/ui/DifficultyPill";
import { Icon } from "@/components/ui/Icon";

export interface ProblemRowProps {
  problem: Problem;
  showTopic?: boolean;
  showReviewButton?: boolean;
  /** Extra tags rendered after the title. */
  extra?: ReactNode;
  highlighted?: boolean;
}

export const ProblemRow = forwardRef<HTMLDivElement, ProblemRowProps>(function ProblemRow(
  { problem, showTopic, showReviewButton, extra, highlighted },
  ref,
) {
  const { state, now, getSolved, toggleSolved, toggleFlag, setNote, markReviewed, countSolved } = useProgress();
  const toast = useToast();
  const [notesOpen, setNotesOpen] = useState(false);

  const { id, title, topic } = problem;
  const entry = getSolved(id);
  const solved = !!entry;
  const flagged = !!state.flagged[id];
  const note = state.notes[id] ?? "";

  const handleToggle = () => {
    const nowSolved = toggleSolved(id);
    if (!nowSolved) return;
    const topicDone = countSolved(topic.problems) + 1 === topic.problems.length;
    toast(topicDone ? `🎉 ${topic.name} complete!` : `Solved: ${title}. First review in 2 days.`);
  };

  const handleReviewed = () => {
    markReviewed(id);
    const nextEntry = entry && { ...entry, stage: entry.stage + 1 };
    toast(isMastered(nextEntry) ? `Mastered: ${title} 💪` : "Review logged. Next one is scheduled.");
  };

  return (
    <div ref={ref} className={`prob${solved ? " is-done" : ""}${highlighted ? " flash" : ""}`} id={`p-${id}`}>
      <div className="prob-row">
        <button
          type="button"
          className={`checkbox${solved ? " on" : ""}`}
          role="checkbox"
          aria-checked={solved}
          aria-label={`Mark ${title} as solved`}
          onClick={handleToggle}
        >
          <Icon name="check" />
        </button>
        <span className="prob-num">{id}</span>
        <div className="prob-title">
          <a href={leetCodeUrl(problem)} target="_blank" rel="noopener noreferrer">
            {title}
            <Icon name="external" />
          </a>
          {problem.premium && (
            <span className="tag premium" title="Needs LeetCode Premium">
              Premium
            </span>
          )}
          {isMastered(entry) ? (
            <span className="tag mastered">Mastered</span>
          ) : (
            isReviewDue(entry, now) && <span className="tag due">Review due</span>
          )}
          {showTopic && <span className="prob-topic">· {topic.name}</span>}
          {extra}
        </div>
        <DifficultyPill difficulty={problem.difficulty} />
        <div className="prob-actions">
          {showReviewButton && solved && (
            <button type="button" className="btn btn-sm" onClick={handleReviewed}>
              <Icon name="redo" /> Reviewed
            </button>
          )}
          <button
            type="button"
            className={`icon-btn${flagged ? " on" : ""}`}
            aria-pressed={flagged}
            title={flagged ? "Remove from revisit list" : "Flag to revisit (got stuck)"}
            onClick={() => toggleFlag(id)}
          >
            <Icon name="flag" />
          </button>
          <button
            type="button"
            className={`icon-btn${note ? " has-note" : ""}`}
            aria-expanded={notesOpen}
            title="Notes"
            onClick={() => setNotesOpen((o) => !o)}
          >
            <Icon name="note" />
          </button>
        </div>
      </div>
      {notesOpen && (
        <div className="prob-notes">
          <textarea
            autoFocus
            value={note}
            aria-label={`Notes for ${title}`}
            placeholder="Approach, time/space complexity, the trick you missed…"
            onChange={(e) => setNote(id, e.target.value)}
          />
          <div className="hint">Saved automatically in this browser.</div>
        </div>
      )}
    </div>
  );
});

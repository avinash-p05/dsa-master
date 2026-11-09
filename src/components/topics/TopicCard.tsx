import { Link } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import type { Topic } from "@/types/roadmap";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";

const MAX_CONCEPTS_SHOWN = 3;

export function TopicCard({ topic }: { topic: Topic }) {
  const { countSolved } = useProgress();
  const solved = countSolved(topic.problems);
  const total = topic.problems.length;
  const complete = solved === total;
  const concepts = topic.concepts.slice(0, MAX_CONCEPTS_SHOWN).join(", ");

  return (
    <Link className={`card topic-card${complete ? " complete" : ""}`} to={`/topic/${topic.slug}`}>
      <div className="row">
        <h3>
          <span className="topic-num">{String(topic.index).padStart(2, "0")}</span>
          {topic.name}
        </h3>
        <span className="count">
          {complete && <Icon name="check" className="check-icon" />} {solved}/{total}
        </span>
      </div>
      <div className="meta">
        Priority: {topic.priority} · {concepts}
        {topic.concepts.length > MAX_CONCEPTS_SHOWN && "…"}
      </div>
      <ProgressBar value={solved} total={total} label={`${topic.name} progress`} />
    </Link>
  );
}

import { useProgress } from "@/hooks/useProgress";
import type { Topic } from "@/types/roadmap";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Icon } from "@/components/ui/Icon";

export function ConceptPanel({ topic }: { topic: Topic }) {
  const { state, toggleConceptCollapsed } = useProgress();
  const collapsed = !!state.collapsed[topic.slug];
  const bodyId = `concept-${topic.slug}`;

  return (
    <section className={`card learn${collapsed ? " collapsed" : ""}`}>
      <button
        type="button"
        className="learn-head"
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        onClick={() => toggleConceptCollapsed(topic.slug)}
      >
        <h2>Understand the concept first</h2>
        <Icon name="chevron" className="chev" />
      </button>
      <div className="learn-body" id={bodyId}>
        {topic.note && <div className="note">{topic.note}</div>}
        <p>{topic.overview}</p>
        <div className="chips">
          {topic.concepts.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>
        <div className="learn-grid">
          <div>
            <h3>Spot this pattern when…</h3>
            <ul>
              {topic.recognize.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <h3>Common pitfalls</h3>
            <ul>
              {topic.pitfalls.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Core template (Java)</h3>
            <CodeBlock code={topic.template} />
          </div>
        </div>
      </div>
    </section>
  );
}

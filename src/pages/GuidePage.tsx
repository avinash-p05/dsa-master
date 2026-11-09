import { Link } from "react-router-dom";
import { PHASES, PROBLEMS, TOPICS, TOTAL_PROBLEMS } from "@/data";
import { percent } from "@/lib/format";
import { DifficultyDot } from "@/components/ui/DifficultyPill";

const DAILY_ROUTINE = [
  ["Learn or revise one pattern", "30 min"],
  ["Solve 2 new problems", "90 min"],
  ["Revisit previously failed problems", "30 min"],
  ["Complexity analysis and notes", "15 min"],
  ["Total", "2 hr 45 min"],
] as const;

const RULES = [
  "First attempt: 25–35 minutes without looking at solutions.",
  "If you're stuck, work out which concept you're missing before you check hints.",
  "Write the brute force before you optimise.",
  "Implement the optimal approach in Java.",
  "Revisit after 2, 7 and 14 days. The Review tab does this for you.",
  "Understanding someone else's solution doesn't mean you've mastered the problem.",
];

export function GuidePage() {
  const count = (d: "E" | "M" | "H") => PROBLEMS.filter((p) => p.difficulty === d).length;
  const easy = count("E");
  const medium = count("M");
  const hard = count("H");
  const premium = PROBLEMS.filter((p) => p.premium).length;

  return (
    <>
      <div className="page-head">
        <div className="eyebrow">How to use this roadmap</div>
        <h1>Execution plan</h1>
        <p>
          About 10–12 weeks, depending on how much time you have each day. Don&apos;t race through all{" "}
          {TOTAL_PROBLEMS} in order without checking that you actually understand them.
        </p>
      </div>

      <div className="guide-grid">
        <section className="card guide-card">
          <h2>Daily routine</h2>
          <table className="sched">
            <tbody>
              {DAILY_ROUTINE.map(([task, time]) => (
                <tr key={task}>
                  <td>{task}</td>
                  <td>{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card guide-card">
          <h2>Rules for every problem</h2>
          <ul>
            {RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="card guide-card">
          <h2>How the tracker works</h2>
          <ol>
            <li>
              Open a topic and read <em>Understand the concept first</em>.
            </li>
            <li>Click a problem title to open it on LeetCode, then solve and submit it there.</li>
            <li>Come back and tick the checkbox. Flag it if you needed hints.</li>
            <li>Use the notes icon to jot down the approach and its complexity.</li>
            <li>
              Check the <Link to="/review">Review</Link> tab every day.
            </li>
          </ol>
        </section>

        <section className="card guide-card">
          <h2>What&apos;s in the {TOTAL_PROBLEMS}</h2>
          <div className="mix" aria-hidden="true">
            <span style={{ width: `${percent(easy, TOTAL_PROBLEMS)}%` }} />
            <span style={{ width: `${percent(medium, TOTAL_PROBLEMS)}%` }} />
            <span style={{ width: `${percent(hard, TOTAL_PROBLEMS)}%` }} />
          </div>
          <p className="muted mix-legend">
            <span>
              <DifficultyDot difficulty="E" /> {easy} easy
            </span>
            <span>
              <DifficultyDot difficulty="M" /> {medium} medium
            </span>
            <span>
              <DifficultyDot difficulty="H" /> {hard} hard
            </span>
          </p>
          <p className="no-margin">
            {TOPICS.length} topics across {PHASES.length} phases. {premium} problems need LeetCode Premium
            (they&apos;re marked). If you don&apos;t have it, read their descriptions elsewhere and practise the same
            pattern.
          </p>
        </section>
      </div>
    </>
  );
}

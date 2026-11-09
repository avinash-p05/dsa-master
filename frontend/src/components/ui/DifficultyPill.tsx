import { DIFFICULTY_LABEL } from "@/data";
import type { Difficulty } from "@/types/roadmap";

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`pill ${difficulty}`}>{DIFFICULTY_LABEL[difficulty]}</span>;
}

export function DifficultyDot({ difficulty }: { difficulty: Difficulty | "A" }) {
  return <span className={`dot ${difficulty}`} aria-hidden="true" />;
}

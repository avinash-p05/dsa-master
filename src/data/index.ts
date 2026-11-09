import type { Difficulty, Problem, Topic } from "@/types/roadmap";
import { PHASES, TOPIC_DEFINITIONS } from "./roadmap";

export { PHASES };

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  E: "Easy",
  M: "Medium",
  H: "Hard",
};

function isDifficulty(value: string | undefined): value is Difficulty {
  return value === "E" || value === "M" || value === "H";
}

function buildRoadmap() {
  const topics: Topic[] = [];
  const problems: Problem[] = [];
  let nextId = 1;

  TOPIC_DEFINITIONS.forEach((def, i) => {
    const topic: Topic = { ...def, index: i + 1, problems: [] };
    for (const line of def.problems) {
      const [title, slug, difficulty, flag] = line.split("|");
      if (!title || !slug || !isDifficulty(difficulty)) {
        throw new Error(`Malformed problem entry in "${def.slug}": ${line}`);
      }
      const problem: Problem = { id: nextId++, title, slug, difficulty, premium: flag === "P", topic };
      topic.problems.push(problem);
      problems.push(problem);
    }
    topics.push(topic);
  });

  return { topics, problems };
}

const roadmap = buildRoadmap();

export const TOPICS: readonly Topic[] = roadmap.topics;
export const PROBLEMS: readonly Problem[] = roadmap.problems;
export const TOTAL_PROBLEMS = PROBLEMS.length;

const problemById = new Map(PROBLEMS.map((p) => [p.id, p]));
const topicBySlug = new Map(TOPICS.map((t) => [t.slug, t]));

export const getProblem = (id: number) => problemById.get(id);
export const getTopic = (slug: string | undefined) => (slug ? topicBySlug.get(slug) : undefined);
export const leetCodeUrl = (p: Problem) => `https://leetcode.com/problems/${p.slug}/`;

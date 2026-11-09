export type Difficulty = "E" | "M" | "H";

export interface Phase {
  id: number;
  name: string;
  blurb: string;
}

/** A topic as written in the source data file. */
export interface TopicDefinition {
  slug: string;
  phase: number;
  name: string;
  priority: string;
  /** Optional callout shown above the concept overview. */
  note?: string;
  concepts: string[];
  overview: string;
  recognize: string[];
  /** Java template code shown in the concept panel. */
  template: string;
  pitfalls: string[];
  /** Encoded as "Title|leetcode-slug|E/M/H[|P]". */
  problems: string[];
}

export interface Problem {
  /** Global number, 1..N, in roadmap order. */
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  premium: boolean;
  topic: Topic;
}

export interface Topic extends Omit<TopicDefinition, "problems"> {
  /** 1-based position in the roadmap. */
  index: number;
  problems: Problem[];
}

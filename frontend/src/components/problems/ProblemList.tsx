import type { ReactNode } from "react";
import type { Problem } from "@/types/roadmap";
import { ProblemRow, type ProblemRowProps } from "./ProblemRow";

interface ProblemListProps {
  problems: readonly Problem[];
  emptyMessage: ReactNode;
  rowProps?: (problem: Problem) => Omit<ProblemRowProps, "problem">;
}

export function ProblemList({ problems, emptyMessage, rowProps }: ProblemListProps) {
  return (
    <div className="card plist">
      {problems.length ? (
        problems.map((p) => <ProblemRow key={p.id} problem={p} {...rowProps?.(p)} />)
      ) : (
        <div className="empty">{emptyMessage}</div>
      )}
    </div>
  );
}

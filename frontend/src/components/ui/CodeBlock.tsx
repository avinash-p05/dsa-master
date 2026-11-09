import { useMemo } from "react";
import { tokenizeJava } from "@/lib/highlight";

const CLASS_BY_TYPE = { keyword: "kw", comment: "cm", text: undefined } as const;

export function CodeBlock({ code }: { code: string }) {
  const tokens = useMemo(() => tokenizeJava(code), [code]);
  return (
    <pre className="code">
      <code>
        {tokens.map((t, i) => {
          const className = CLASS_BY_TYPE[t.type];
          return className ? (
            <span key={i} className={className}>
              {t.text}
            </span>
          ) : (
            t.text
          );
        })}
      </code>
    </pre>
  );
}

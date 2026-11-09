export type TokenType = "keyword" | "comment" | "text";

export interface Token {
  type: TokenType;
  text: string;
}

const JAVA_TOKENS =
  /(\/\/.*$)|\b(int|long|boolean|char|void|return|if|else|for|while|new|class|true|false|null|private|protected|public|final|extends|continue|break|static|super)\b/gm;

/** Minimal Java tokenizer for the concept templates: keywords and line comments. */
export function tokenizeJava(source: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of source.matchAll(JAVA_TOKENS)) {
    const start = match.index ?? 0;
    if (start > last) tokens.push({ type: "text", text: source.slice(last, start) });
    tokens.push({ type: match[1] ? "comment" : "keyword", text: match[0] });
    last = start + match[0].length;
  }
  if (last < source.length) tokens.push({ type: "text", text: source.slice(last) });
  return tokens;
}

import { codeToTokensBase, createShikiPrimitive } from "@shikijs/primitive";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import move from "@shikijs/langs/move";

/* Only Move and one CSS-variable Frontier theme enter the bundle.
   Returns tokens rather than HTML so React renders escaped text. */
const highlighter = createShikiPrimitive({
  engine: createJavaScriptRegexEngine(),
  langs: [move],
  themes: [
    {
      name: "frontier-move",
      type: "dark",
      settings: [
        { settings: { foreground: "var(--color-foreground)", background: "transparent" } },
        { scope: ["keyword", "storage.modifier", "storage.type"], settings: { foreground: "var(--color-syntax-keyword)" } },
        { scope: ["constant", "variable.other.constant"], settings: { foreground: "var(--color-syntax-constant)" } },
        { scope: ["entity.name.function", "support.function"], settings: { foreground: "var(--color-syntax-function)" } },
        { scope: ["entity.name.type", "support.type"], settings: { foreground: "var(--color-syntax-type)" } },
        { scope: ["string"], settings: { foreground: "var(--color-syntax-string)" } },
        { scope: ["comment"], settings: { foreground: "var(--color-syntax-comment)", fontStyle: "italic" } },
      ],
    },
  ],
});

export type MoveToken = {
  content: string;
  color?: string;
  fontStyle?: number;
};

const tokenCache = new Map<string, MoveToken[][]>();

/* The Move TextMate grammar only activates statement/expression rules inside a
   module + function block. Wrap standalone statement snippets for tokenization
   and strip the synthetic wrapper lines afterward. */
const TOP_LEVEL_DECL = /^\s*(?:\/\/[^\n]*\n\s*)*(?:module|use|const|public|entry|fun|struct|enum|spec|#\[)\b/;

export function tokenizeMove(source: string): MoveToken[][] {
  const cached = tokenCache.get(source);
  if (cached) return cached;
  const wrap = !TOP_LEVEL_DECL.test(source);
  const input = wrap ? `module _::_ {\nfun _() {\n${source}\n}\n}` : source;
  const raw = codeToTokensBase(highlighter, input, { lang: "move", theme: "frontier-move" });
  const tokens = wrap ? raw.slice(2, -2) : raw;
  if (tokenCache.size > 64) tokenCache.clear();
  tokenCache.set(source, tokens);
  return tokens;
}

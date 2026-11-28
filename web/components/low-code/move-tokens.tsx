import type { MoveToken } from "./move-highlight";

export function MoveTokenSpans({ tokens }: { tokens: MoveToken[] }) {
  return tokens.map((token, tokenIndex) => (
    <span
      key={tokenIndex}
      className="forced-colors:text-[CanvasText]!"
      style={{
        color: token.color,
        fontStyle: token.fontStyle && (token.fontStyle & 1) ? "italic" : undefined,
      }}
    >
      {token.content}
    </span>
  ));
}

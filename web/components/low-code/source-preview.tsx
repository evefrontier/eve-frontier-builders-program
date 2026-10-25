import { useId } from "react";
import { cn } from "@/lib/cn";
import { formatSource, correspondingLines } from "./source.mjs";
import type { ValueConnection, SocketType } from "./connections.mjs";

export function SourcePreview({
  values,
  connections,
  selection,
  customNames,
  customTypes,
}: {
  values: Record<string, string>;
  connections: ValueConnection[];
  selection: string | null;
  customNames?: Record<string, string>;
  customTypes?: Record<string, SocketType>;
}) {
  const headingId = useId();
  const { errors, lines } = formatSource(values, connections, customNames, customTypes);
  const matches = correspondingLines(lines, selection);
  return (
    <section className="grid min-w-0 gap-3" aria-labelledby={headingId}>
      <h3 id={headingId} className="text-step-0">Illustrative Move · uncompiled · not the vending contract</h3>
      <p>This only demonstrates declarations and quantity uses, not a generated contract or full Move type checking.</p>
      {errors.length ? (
        <div role="status">
          <p>Source withheld. Fix:</p>
          <ul>{errors.map(error => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : (
        <>
          <p aria-live="polite">
            Tracing {selection ?? "nothing"} · {matches.length ? "▶ matching lines " + matches.join(", ") : "no corresponding lines"}
          </p>
          <pre
            tabIndex={0}
            aria-label="Line-numbered illustrative Move"
            className={cn(
              "overflow-x-auto bg-card p-4 text-step--2 leading-[1.8] text-foreground",
              "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-foreground",
              "forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
            )}
          >
            <code>
              {lines.map((line, index) => {
                const match = matches.includes(index + 1);
                return (
                  <span
                    key={index}
                    className={cn(
                      "block min-w-max border-l-[3px]",
                      match ? "border-accent-text bg-card-secondary font-bold forced-colors:border-[Highlight]" : "border-transparent",
                    )}
                  >
                    <span aria-hidden="true">{match ? "▶" : " "} {String(index + 1).padStart(2)} │ </span>
                    {line.text}
                    {"\n"}
                  </span>
                );
              })}
            </code>
          </pre>
        </>
      )}
    </section>
  );
}

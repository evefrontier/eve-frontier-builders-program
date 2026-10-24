import { formatSource, correspondingLines } from "./source.mjs";
import type { ValueConnection } from "./connections.mjs";
import styles from "./source-preview.module.css";

export function SourcePreview({ values, connections, selection }: {
  values: Record<string, string>; connections: ValueConnection[]; selection: string | null;
}) {
  const { errors, lines } = formatSource(values, connections);
  const matches = correspondingLines(lines, selection);
  return <section className={styles.source} aria-label="Illustrative Move source">
    <h3 className="text-step-0">Illustrative Move · uncompiled · not the vending contract</h3>
    <p>This only demonstrates declarations and quantity uses, not a generated contract or full Move type checking.</p>
    {errors.length ? <div role="status"><p>Source withheld. Fix:</p>
      <ul>{errors.map(error => <li key={error}>{error}</li>)}</ul>
    </div> : <>
      <p aria-live="polite">Tracing {selection ?? "nothing"} · {matches.length ? "▶ matching lines " + matches.join(", ") : "no corresponding lines"}</p>
      <pre tabIndex={0} aria-label="Line-numbered illustrative Move"><code>
        {lines.map((line, index) => <span key={index} className={matches.includes(index + 1) ? styles.match : styles.line}>
          <span aria-hidden="true">{matches.includes(index + 1) ? "▶" : " "} {String(index + 1).padStart(2)} │ </span>{line.text}{"\n"}
        </span>)}
      </code></pre>
    </>}
  </section>;
}

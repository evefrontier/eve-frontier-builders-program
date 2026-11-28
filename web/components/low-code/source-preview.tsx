"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatSource, correspondingLines, type SourceLine } from "./source.mjs";
import { tokenizeMove } from "./move-highlight";
import { MoveTokenSpans } from "./move-tokens";
import type { ValueConnection, SocketType } from "./connections.mjs";

export type GeneratedSourceInput = {
  lines: SourceLine[];
  errors?: string[];
};

export type SourcePreviewProps =
  | {
      values: Record<string, string>;
      connections: ValueConnection[];
      selection: string | null;
      customNames?: Record<string, string>;
      customTypes?: Record<string, SocketType>;
      generated?: never;
      heading?: string;
      description?: ReactNode;
      emptyMessage?: string;
      emptyHint?: string;
      ariaLabel?: string;
    }
  | {
      generated: GeneratedSourceInput;
      selection: string | null;
      heading?: string;
      description?: ReactNode;
      emptyMessage?: string;
      emptyHint?: string;
      ariaLabel?: string;
      values?: never;
      connections?: never;
      customNames?: never;
      customTypes?: never;
    };

export function SourcePreview(props: SourcePreviewProps) {
  const headingId = useId();
  const { selection, heading, description, emptyMessage, emptyHint, ariaLabel } = props;

  const { errors, lines } = props.generated
    ? { errors: props.generated.errors ?? [], lines: props.generated.lines }
    : formatSource(props.values, props.connections, props.customNames, props.customTypes);

  const sourceText = lines.map((line) => line.text).join("\n");
  const tokenLines = sourceText ? tokenizeMove(sourceText) : [];
  const matches = correspondingLines(lines, selection);

  const defaultHeading = props.generated ? "Generated Move" : "Illustrative Move · uncompiled · not the vending contract";
  const defaultDescription = props.generated
    ? undefined
    : "This only demonstrates declarations and quantity uses, not a generated contract or full Move type checking.";

  return (
    <section className="grid min-w-0 gap-3" aria-labelledby={headingId}>
      <div className="grid gap-1">
        <h3 id={headingId} className="font-heading text-step--1 font-bold">
          {heading ?? defaultHeading}
        </h3>
        {(description ?? defaultDescription) && (
          <p className="text-step--2 text-muted">{description ?? defaultDescription}</p>
        )}
      </div>

      {errors.length > 0 || lines.length === 0 ? (
        <div
          role="status"
          className="grid gap-1.5 border border-line bg-card p-4 text-step--2 text-muted"
        >
          {emptyMessage ? (
            <>
              <p className="font-semibold text-foreground">{emptyMessage}</p>
              {emptyHint && <p>{emptyHint}</p>}
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">Source withheld. Fix:</p>
              <ul className="list-disc pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : (
        <>
          <p aria-live="polite" className="text-step--2 text-muted">
            Tracing {selection ?? "nothing"} ·{" "}
            {matches.length ? `▶ matching lines ${matches.join(", ")}` : "no corresponding lines"}
          </p>
          <pre
            tabIndex={0}
            aria-label={ariaLabel ?? (props.generated ? "Read-only generated Move source" : "Line-numbered illustrative Move")}
            className={cn(
              "overflow-x-auto border border-line bg-card p-3 font-heading text-step--2 leading-[1.8] text-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
              "forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
            )}
          >
            <code>
              {lines.map((line, index) => {
                const match = matches.includes(index + 1);
                const tokens = tokenLines[index];
                return (
                  <span
                    key={index}
                    className={cn(
                      "block min-w-max border-l-[3px] pr-2",
                      match
                        ? "border-accent-text bg-card-secondary font-bold forced-colors:border-[Highlight]"
                        : "border-transparent",
                    )}
                  >
                    <span aria-hidden="true" className="select-none text-muted">
                      {match ? "▶" : " "} {String(index + 1).padStart(2)} │{" "}
                    </span>
                    {tokens && tokens.length > 0 ? <MoveTokenSpans tokens={tokens} /> : line.text}
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

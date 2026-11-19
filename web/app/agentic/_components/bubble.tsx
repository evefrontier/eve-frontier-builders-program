import type { ReactNode, Ref } from "react";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Stage } from "@/app/agentic/_content";

type BubbleProps = {
  from: "you" | "ai";
  /** Replaces the "You" or "AI agent" label. */
  label?: string;
  /** Which step of the loop the message is, shown beside the label. */
  stage?: Stage;
  /** A short teaching point under the message. */
  note?: string;
  /** Something shown with the message, such as a mocked test result. */
  attachment?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
};

/** A chat message: yours on the right, the AI's on the left, each cut on its speaker's side. */
export function Bubble({ from, label, stage, note, attachment, ref, children }: BubbleProps) {
  const you = from === "you";

  return (
    <div ref={ref} className={cn("grid w-full max-w-[36rem] gap-3xs", you ? "justify-self-end" : "justify-self-start")}>
      <span
        className={cn(
          "flex gap-2xs text-step--2 font-bold tracking-[0.06em] uppercase",
          you ? "justify-end text-accent-text" : "text-muted",
        )}
      >
        {label ?? (you ? "You" : "AI agent")}
        {stage && <span className="text-muted">· {stage}</span>}
      </span>
      <Plate
        corners={you ? "br" : "bl"}
        cut="md"
        keyline={you ? "var(--color-tint-border)" : undefined}
        fill={you ? "var(--color-tint-background)" : undefined}
        className="px-s py-xs text-step--1"
      >
        {children}
        {attachment}
      </Plate>
      {note && <p className={cn("text-step--2 font-bold text-accent-text", you && "text-right")}>{note}</p>}
    </div>
  );
}

import { Plate } from "@/components/ui";
import { loop, loopAsk, loopNote } from "@/app/agentic/_content";

/** The five steps every build goes round, and who does each. */
export function TheLoop() {
  return (
    <>
      <ol className="grid gap-xs">
        {loop.map((step, index) => (
          <li key={step.stage}>
            <Plate
              corners="tr-bl"
              cut="sm"
              keyline={step.who === "You" ? "var(--color-accent)" : undefined}
              fill={step.who === "You" ? "var(--color-tint-background)" : undefined}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-s gap-y-3xs p-s sm:grid-cols-[2.5rem_8rem_minmax(0,1fr)]"
            >
              <span className="font-heading text-step-1 font-bold text-accent-text">{index + 1}</span>
              <span className="grid">
                <span className="font-heading text-step-0 font-bold">{step.stage}</span>
                <span className="text-step--2 font-bold tracking-[0.06em] text-muted uppercase">{step.who}</span>
              </span>
              <p className="col-start-2 text-step--1 sm:col-start-3">{step.body}</p>
            </Plate>
          </li>
        ))}
      </ol>
      <p className="flex items-baseline gap-xs text-step-0 font-bold">
        <span className="text-accent-text" aria-hidden="true">
          ↑
        </span>
        Then round again with the next piece.
      </p>
      <p className="border-l-2 border-accent pl-s text-step-0">{loopAsk}</p>
      <p className="text-step--1 text-muted">{loopNote}</p>
    </>
  );
}

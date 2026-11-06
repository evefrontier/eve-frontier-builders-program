"use client";

import { useState } from "react";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import { tryIt, tryPairs } from "@/app/agentic/_content";
import { useAnswers } from "../_components/answers";

/** Pick the better of two opening messages, then see why. */
export function TryIt() {
  const { idea } = useAnswers();
  // The stronger one goes first for half the ideas, so position gives nothing away
  const pair = tryPairs[idea ?? "turrets"];
  const strongFirst = idea === "gate" || idea === "bounty" || idea === "other";
  const options = strongFirst
    ? [{ text: pair.strong, strong: true }, { text: pair.weak, strong: false }]
    : [{ text: pair.weak, strong: false }, { text: pair.strong, strong: true }];

  return <Picker key={idea ?? "turrets"} options={options} />;
}

function Picker({ options }: { options: { text: string; strong: boolean }[] }) {
  const [picked, setPicked] = useState<number>();
  const choice = picked === undefined ? undefined : options[picked];

  return (
    <>
      <div role="group" aria-label={tryIt.pick} className="grid gap-xs md:grid-cols-2">
        {options.map((option, index) => {
          const chosen = picked === index;
          const revealed = choice?.strong === true;
          return (
            <Plate
              key={option.text}
              as="button"
              type="button"
              corners="tr-bl"
              cut="sm"
              aria-pressed={chosen}
              onClick={() => setPicked(index)}
              className={cn(
                "grid cursor-pointer content-start gap-2xs p-s text-left outline-none",
                chosen && option.strong && "[--plate-fill:var(--color-tint-background)] [--plate-keyline:var(--color-accent)] [--plate-keyline-width:2px]",
                chosen && !option.strong && "[--plate-keyline:var(--color-control-line)] [--plate-keyline-width:2px]",
                !chosen && !revealed && "hover:[--plate-fill:var(--color-card-secondary)]",
                revealed && !chosen && "opacity-60",
                "focus-visible:[--plate-keyline:var(--color-foreground)] focus-visible:[--plate-keyline-width:2px]",
              )}
            >
              <span className="text-step--2 font-bold tracking-[0.06em] text-muted uppercase">
                Message {index === 0 ? "A" : "B"}
              </span>
              <span className="text-step--1">&ldquo;{option.text}&rdquo;</span>
            </Plate>
          );
        })}
      </div>

      <div aria-live="polite">
        {choice && (
          <Plate
            corners="tl-br"
            cut="sm"
            keyline={choice.strong ? "var(--color-tint-border)" : undefined}
            fill={choice.strong ? "var(--color-tint-background)" : undefined}
            className="grid gap-xs p-s"
          >
            <p className="text-step-0">
              <b className={choice.strong ? "text-tint-text" : undefined}>{choice.strong ? "Good pick. " : "Not quite. "}</b>
              {choice.strong ? tryIt.right : tryIt.wrong}
            </p>
            {!choice.strong && <p className="text-step--1 text-muted">{tryIt.again}</p>}
          </Plate>
        )}
      </div>
    </>
  );
}

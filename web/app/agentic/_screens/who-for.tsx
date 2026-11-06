"use client";

import { Plate } from "@/components/ui";
import { always, audienceQuestion, audiences } from "@/app/agentic/_content";
import { setAnswer, useAnswers } from "../_components/answers";
import { ChoiceGroup } from "../_components/choice-group";

/** Question 1: who it's for, confirmed in one line. */
export function WhoFor() {
  const { audience } = useAnswers();

  return (
    <>
      <span className="text-step--2 font-bold tracking-[0.06em] text-muted uppercase">{audienceQuestion.step}</span>
      <ChoiceGroup
        name="audience"
        legend="Who is it for?"
        choices={audienceQuestion.choices}
        value={audience}
        onChange={(id) => setAnswer("audience", id)}
      />
      <div aria-live="polite">
        {audience && (
          <Plate
            corners="tl-br"
            cut="sm"
            keyline="var(--color-tint-border)"
            fill="var(--color-tint-background)"
            className="grid gap-xs p-s"
          >
            <p className="text-step-0">
              <b className="text-tint-text">Got it. </b>
              {audiences[audience].confirm}
            </p>
            <p className="text-step--1 font-bold">{always.short}</p>
          </Plate>
        )}
      </div>
    </>
  );
}

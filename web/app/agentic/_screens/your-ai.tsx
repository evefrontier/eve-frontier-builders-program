"use client";

import { Plate } from "@/components/ui";
import { toolQuestion, tools } from "@/app/agentic/_content";
import { setAnswer, useAnswers } from "../_components/answers";
import { ChoiceGroup } from "../_components/choice-group";
import { PixelArt } from "../_components/pixel-art";

const pictures = {
  none: <PixelArt name="sparkle" />,
  chat: <PixelArt name="chat" />,
  desktop: <PixelArt name="folder" />,
  editor: <PixelArt name="editor" />,
  cloud: <PixelArt name="cloud" />,
};

/** Question 2: which rung of the ladder you're on, and when to step up. */
export function YourAi() {
  const { tool } = useAnswers();

  return (
    <>
      <span className="text-step--2 font-bold tracking-[0.06em] text-muted uppercase">{toolQuestion.step}</span>
      <ChoiceGroup
        name="tool"
        legend="Which AI do you have?"
        columns={1}
        choices={toolQuestion.choices}
        pictures={pictures}
        value={tool}
        onChange={(id) => setAnswer("tool", id)}
      />
      <div aria-live="polite">
        {tool && (
          <Plate
            corners="tl-br"
            cut="sm"
            keyline="var(--color-tint-border)"
            fill="var(--color-tint-background)"
            className="grid gap-xs p-s"
          >
            <p className="text-step-0">
              <b className="text-tint-text">Got it. </b>
              {tools[tool].confirm}
            </p>
            <p className="text-step--1">
              <b className="text-tint-text">When to step up: </b>
              {tools[tool].next}
            </p>
          </Plate>
        )}
      </div>
    </>
  );
}

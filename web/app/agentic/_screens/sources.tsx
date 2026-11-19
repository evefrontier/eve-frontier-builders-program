"use client";

import { Icon } from "@/components/ui";
import { EXTERNAL } from "@/lib/external";
import { ideas, sources, sourcesPrompt, sourcesUi } from "@/app/agentic/_content";
import { useAnswers } from "../_components/answers";
import { Bubble } from "../_components/bubble";

/** What to tell the AI first; the links are only a fallback. */
export function Sources() {
  const { idea, tool } = useAnswers();
  const topic = ideas.find((item) => item.id === idea)?.topic ?? "my idea";
  const chatOnly = tool === "chat" || tool === "none";

  return (
    <>
      <Bubble from="you" label="You might say">
        {sourcesPrompt(topic)}
      </Bubble>

      <p className="text-step-0">{sourcesUi.note}</p>

      <section aria-labelledby="fallback" className="grid gap-2xs">
        <h2 id="fallback" className="text-step--2 font-bold tracking-[0.06em] text-muted uppercase">
          {sourcesUi.fallback}
        </h2>
        <ul className="grid gap-2xs border-l-2 border-line pl-s">
          {sources.map((source) => (
            <li key={source.href} className="text-step--1">
              <a
                href={source.href}
                {...EXTERNAL}
                className="inline-flex items-center gap-2xs font-bold text-accent-text underline underline-offset-4"
              >
                {source.label}
                <Icon name="external" className="size-2.5" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <span className="text-muted">: {source.what}</span>
            </li>
          ))}
        </ul>
        {chatOnly && <p className="text-step--1 text-muted">{sourcesUi.chatNote}</p>}
      </section>
    </>
  );
}

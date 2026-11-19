"use client";

import { audiences, ideas, ready, starter, tools } from "@/app/agentic/_content";
import { useAnswers } from "../_components/answers";
import { Bubble } from "../_components/bubble";
import { CopyButton } from "../_components/copy-button";
import { WithYourAi } from "../_components/with-your-ai";

/** What the reader now knows, and an opening message built from their answers. */
export function Ready() {
  const { idea, audience, tool } = useAnswers();
  const want = ideas.find((item) => item.id === idea)?.want ?? ideas[ideas.length - 1].want;
  const message = starter(want, audience && audiences[audience].phrase, tool && tools[tool].phrase, tool && tools[tool].extra);

  return (
    <>
      <section aria-labelledby="recap" className="grid gap-xs">
        <h2 id="recap" className="text-step-1">
          {ready.recapTitle}
        </h2>
        <ul className="grid gap-xs">
          {ready.recap.map((line) => (
            <li key={line} className="flex gap-xs text-step-0">
              <span className="mt-[0.55em] size-2 flex-none bg-accent" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="start" className="grid gap-xs">
        <h2 id="start" className="text-step-1">
          {ready.startTitle}
        </h2>
        <Bubble from="you" label="You might say">
          {message}
        </Bubble>
        <div className="flex flex-wrap items-center justify-end gap-s">
          <p className="text-step--1 text-muted">{ready.startNote}</p>
          <CopyButton text={message} label={ready.copy} done={ready.copied} />
        </div>
        <WithYourAi />
      </section>

      <section aria-labelledby="further" className="grid gap-xs">
        <h2 id="further" className="text-step--1 font-bold tracking-[0.06em] text-muted uppercase">
          {ready.further}
        </h2>
        {/* Plain text, not cards: these pages don't exist yet, so nothing should look clickable */}
        <ul className="grid gap-2xs">
          {ready.links.map((link) => (
            <li key={link.label} className="text-step--1">
              <span className="font-bold">{link.label}</span>
              <span className="text-muted">, {link.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

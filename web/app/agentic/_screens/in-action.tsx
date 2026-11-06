"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Plate } from "@/components/ui";
import { conversationUi, conversations, ideas, type IdeaId } from "@/app/agentic/_content";
import { useAnswers } from "../_components/answers";
import { Bubble } from "../_components/bubble";
import { Proof } from "../_components/proof";
import { WithYourAi } from "../_components/with-your-ai";

/** A first conversation about the reader's idea, revealed a message at a time. */
export function InAction() {
  const { idea } = useAnswers();
  const [picked, setPicked] = useState<IdeaId>();
  const shown = picked ?? idea ?? "turrets";
  const others = ideas.filter((item) => item.id !== shown);

  return (
    <>
      <WithYourAi />
      <Stepper key={shown} idea={shown} />
      <p className="flex flex-wrap items-baseline gap-x-s gap-y-2xs text-step--1">
        <span className="text-muted">{conversationUi.others}</span>
        {others.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPicked(item.id)}
            className="cursor-pointer font-bold text-accent-text underline underline-offset-4 hover:text-foreground"
          >
            {conversations[item.id].title}
          </button>
        ))}
      </p>
    </>
  );
}

function Stepper({ idea }: { idea: IdeaId }) {
  const { title, messages } = conversations[idea];
  const [count, setCount] = useState(1);
  const latest = useRef<HTMLDivElement>(null);
  const grew = useRef(false);
  const done = count >= messages.length;

  // Bring each new message into view, but not on first render
  useEffect(() => {
    if (!grew.current) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    latest.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "nearest" });
  }, [count]);

  const reveal = (to: number) => {
    grew.current = true;
    setCount(to);
  };

  return (
    <Plate corners="tl-br" cut="md" fill="var(--color-background)" className="grid gap-s p-s-m">
      <span className="text-step--2 font-bold tracking-[0.06em] text-muted uppercase">Example: {title}</span>
      <div className="grid gap-s" aria-live="polite">
        {messages.slice(0, count).map((message, index) => (
          <Bubble
            key={index}
            ref={index === count - 1 ? latest : undefined}
            from={message.from}
            stage={message.stage}
            note={message.note}
            attachment={message.visual && <Proof visual={message.visual} />}
          >
            {message.text}
          </Bubble>
        ))}
      </div>
      {done ? (
        <p className="text-step--1 font-bold text-accent-text">{conversationUi.done}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-s">
          <Button variant="secondary" size="sm" onClick={() => reveal(count + 1)}>
            {conversationUi.continue} ({count} of {messages.length})
          </Button>
          <button
            type="button"
            onClick={() => reveal(messages.length)}
            className="cursor-pointer text-step--1 font-bold text-muted underline underline-offset-4 hover:text-foreground"
          >
            {conversationUi.all}
          </button>
        </div>
      )}
    </Plate>
  );
}

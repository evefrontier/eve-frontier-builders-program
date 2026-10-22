"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plate } from "@/components/ui";
import { setAnswer, useAnswers } from "@/components/portal/answers";
import type { Question } from "@/lib/content/types";
import { QuestionField } from "./personal";

export type FinderPathway = {
  slug: string;
  title: string;
  href: string;
  description?: string;
  audience?: string;
  for?: Record<string, string>;
  courses: string[];
};

const eyebrow = "font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase";

/**
 * A few questions, one revealed at a time, that end at the pathways matching
 * the reader's answers. The answers stay on the device and carry into lessons.
 */
export function PathwayFinder({ title, questions, pathways, result, none }: {
  title: string;
  questions: Question[];
  pathways: FinderPathway[];
  result: string;
  none: string;
}) {
  const answers = useAnswers();
  const answered = questions.filter((q) => answers[q.id]).length;
  // Each step shows once the one before it has an answer
  const shown = questions.slice(0, Math.min(questions.findIndex((q) => !answers[q.id]) + 1 || questions.length, questions.length));
  const complete = answered === questions.length;
  const matches = pathways.filter((p) => p.for && Object.entries(p.for).every(([q, a]) => answers[q] === a));

  const steps = useRef<(HTMLElement | null)[]>([]);
  const end = useRef<HTMLElement>(null);
  const [moved, setMoved] = useState(0);

  // After an answer, bring the next step or the result into view
  useEffect(() => {
    if (!moved) return;
    const target = complete ? end.current : steps.current[shown.length - 1];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  }, [moved, complete, shown.length]);

  return (
    <section aria-labelledby="finder" className="mt-l border-t border-line pt-l">
      <div className="flex flex-wrap items-baseline justify-between gap-s">
        <h2 id="finder" className="text-step-3">{title}</h2>
        {answered > 0 && (
          <button
            type="button"
            onClick={() => questions.forEach((q) => setAnswer(q.id, undefined))}
            className="min-h-6 text-step--1 font-bold text-accent-text underline underline-offset-2"
          >
            Start over
          </button>
        )}
      </div>

      {shown.map((question, i) => (
        <section
          key={question.id}
          ref={(node) => {
            steps.current[i] = node;
          }}
          aria-label={`Step ${i + 1} of ${questions.length}`}
          className="mt-l scroll-mt-[calc(var(--bar-height)+1rem)]"
        >
          <p className={eyebrow}>Step {i + 1} of {questions.length}</p>
          <QuestionField question={question} onAnswer={() => setMoved((n) => n + 1)} />
        </section>
      ))}

      {complete && (
        <section ref={end} aria-labelledby="your-way-in" aria-live="polite" className="mt-l scroll-mt-[calc(var(--bar-height)+1rem)]">
          <h3 id="your-way-in" className={eyebrow}>{result}</h3>
          {matches.length ? (
            <ul role="list" className="mt-xs grid gap-s">
              {matches.map((pathway) => (
                <li key={pathway.slug} className="grid">
                  <Plate
                    as={Link}
                    href={pathway.href}
                    corners="tr-bl"
                    className="grid gap-2xs px-s py-s [--plate-keyline-width:2px] [--plate-keyline:var(--color-accent)] hover:[--plate-fill:var(--color-tint-background)]"
                  >
                    {pathway.audience && <span className={eyebrow}>{pathway.audience}</span>}
                    <span className="text-step-2 font-bold">{pathway.title} <span aria-hidden="true">→</span></span>
                    {pathway.description && <span className="text-muted">{pathway.description}</span>}
                    <span className="text-step--2 text-muted">{pathway.courses.join(" → ")}</span>
                  </Plate>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-xs border-l-2 border-accent pl-s">{none}</p>
          )}
        </section>
      )}
    </section>
  );
}

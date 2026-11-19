"use client";

import Link from "next/link";
import { Plate } from "@/components/ui";
import { always, audiences, safety } from "@/app/agentic/_content";
import { useAnswers } from "../_components/answers";

/** The rules for everyone, then cost, security and upkeep for what the reader is building. */
export function KeepItSafe() {
  const { audience } = useAnswers();
  const tier = audiences[audience ?? "me"];

  return (
    <>
      <Plate corners="tl-br" cut="md" keyline="var(--color-accent)" fill="var(--color-tint-background)" className="grid gap-2xs p-s">
        <h2 className="text-step-1">{always.title}</h2>
        <p className="text-step-0">{always.body}</p>
      </Plate>

      <section aria-labelledby="for-you" className="grid gap-xs">
        <h2 id="for-you" className="text-step--1 font-bold tracking-[0.06em] text-muted uppercase">
          {safety.forYou}
          {!audience && (
            <>
              {" "}
              (<Link href="/agentic/who-for/" className="text-accent-text underline underline-offset-4">tell us who it&apos;s for</Link>)
            </>
          )}
        </h2>
        <ul className="grid gap-xs md:grid-cols-3">
          {tier.watch.map((item) => (
            <li key={item.label} className="flex">
              <Plate corners="tr-bl" cut="sm" className="grid flex-1 content-start gap-2xs p-s">
                <span className="font-heading text-step-0 font-bold text-accent-text">{item.label}</span>
                <p className="text-step--1">{item.text}</p>
              </Plate>
            </li>
          ))}
        </ul>
      </section>

      <Plate corners="tl-br" cut="md" className="grid gap-xs p-s">
        <h2 className="text-step-1">{safety.safeCopy.title}</h2>
        <p className="text-step--1">{safety.safeCopy.body}</p>
      </Plate>

      {audience && audience !== "me" && <p className="text-step--1 text-muted">{safety.previewFirst}</p>}
    </>
  );
}

"use client";

import Link from "next/link";
import { ideas } from "@/app/agentic/_content";
import { useAnswers } from "./answers";

/** The idea picked at the front door, with a way to change it. Nothing shows until one is picked. */
export function YourIdea({ label, change }: { label: string; change?: string }) {
  const { idea } = useAnswers();
  const picked = ideas.find((item) => item.id === idea);
  if (!picked) return null;

  return (
    <p className="flex flex-wrap items-baseline gap-x-xs gap-y-3xs text-step--1">
      <span className="text-muted">{label}</span>
      <b className="text-foreground">{picked.id === "other" ? "your own idea" : picked.title}</b>
      {change && (
        <Link href="/start/" className="font-bold text-accent-text underline underline-offset-4 hover:text-foreground">
          {change}
        </Link>
      )}
    </p>
  );
}

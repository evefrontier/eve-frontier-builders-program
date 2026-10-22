"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Plate } from "@/components/ui";
import type { IdeaId } from "@/app/agentic/_content";
import { setAnswer } from "./answers";

/** An idea card that remembers the pick before moving on to step 2. */
export function IdeaLink({ id, className, children }: { id: IdeaId; className: string; children: ReactNode }) {
  return (
    <Plate
      as={Link}
      href="/start/how/"
      corners="tr-bl"
      cut="md"
      onClick={() => setAnswer("idea", id)}
      className={className}
    >
      {children}
    </Plate>
  );
}

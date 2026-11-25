"use client";

import { withYourAi } from "@/app/agentic/_content";
import { useAnswers } from "./answers";

/** What the course's agent workflow means with the reader's own tool. Nothing until they've said. */
export function WithYourAi() {
  const { tool } = useAnswers();
  if (!tool) return null;

  return (
    <p className="border-l-2 border-accent pl-s text-step--1">
      <b className="text-accent-text">{withYourAi.label}: </b>
      {withYourAi.byTool[tool]}
    </p>
  );
}

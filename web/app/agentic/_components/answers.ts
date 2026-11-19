"use client";

import { useSyncExternalStore } from "react";
import type { AudienceId, IdeaId, ToolId } from "@/app/agentic/_content";

/* Answers are kept on this device, like lesson progress, so they follow the
   reader from lesson to lesson. Storage can be blocked; answers then last for
   this page view only. */
const KEY = "agentic:answers";

export type Answers = { idea?: IdeaId; audience?: AudienceId; tool?: ToolId };

const listeners = new Set<() => void>();
let cache: { raw: string | null; answers: Answers } = { raw: null, answers: {} };

function read(): Answers {
  let raw: string | null = cache.raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Blocked storage: keep what's in memory
  }
  if (raw !== cache.raw) {
    let answers: Answers = {};
    try {
      answers = raw ? JSON.parse(raw) : {};
    } catch {
      answers = {};
    }
    cache = { raw, answers };
  }
  return cache.answers;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const none: Answers = {};

/** The reader's answers. Nothing is answered on the server or while hydrating. */
export function useAnswers() {
  return useSyncExternalStore(subscribe, read, () => none);
}

export function setAnswer<K extends keyof Answers>(key: K, value: Answers[K]) {
  const answers = { ...read(), [key]: value };
  const raw = JSON.stringify(answers);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    // Kept in memory below so the page still reflects the change
  }
  cache = { raw, answers };
  listeners.forEach((listener) => listener());
}

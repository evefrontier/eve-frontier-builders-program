"use client";

import { useSyncExternalStore } from "react";
import type { Answers } from "@/lib/template";

/* The reader's answers, kept on this device like their progress, so a
   pathway question answered once personalises every lesson after it. */
const KEY = "learn:answers";
const listeners = new Set<() => void>();
let cache: { raw: string | null; answers: Answers } = { raw: null, answers: {} };

function read(): Answers {
  let raw = cache.raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Storage can be blocked; answers then last for this page view only
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

/** The reader's answers. Nothing is answered while prerendering or hydrating. */
export function useAnswers() {
  return useSyncExternalStore(subscribe, read, () => none);
}

export function setAnswer(question: string, answer: string | undefined) {
  const answers = { ...read(), [question]: answer };
  const raw = JSON.stringify(answers);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    // Kept in memory below so the page still reflects the change
  }
  cache = { raw, answers };
  listeners.forEach((listener) => listener());
}

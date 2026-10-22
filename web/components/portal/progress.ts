"use client";

import { useSyncExternalStore } from "react";

const KEY = "learn:done";
const listeners = new Set<() => void>();
let cache: { raw: string | null; files: ReadonlySet<string> } = { raw: null, files: new Set() };

function read(): ReadonlySet<string> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Storage can be blocked; progress then lasts only for this page view
  }
  if (raw !== cache.raw) {
    let files: string[] = [];
    try {
      files = raw ? JSON.parse(raw) : [];
    } catch {
      files = [];
    }
    cache = { raw, files: new Set(files) };
  }
  return cache.files;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const empty: ReadonlySet<string> = new Set();

/** Lessons marked complete on this device. */
export function useDone() {
  return useSyncExternalStore(subscribe, read, () => empty);
}

export function setDone(file: string, done: boolean) {
  const files = new Set(read());
  if (done) files.add(file);
  else files.delete(file);
  const raw = JSON.stringify([...files]);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    // Kept in memory below so the page still reflects the change
  }
  cache = { raw, files };
  listeners.forEach((listener) => listener());
}

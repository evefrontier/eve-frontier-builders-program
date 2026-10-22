"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BuildRequest, BuildResponse } from "./build-messages";

const TIMEOUT_MS = 60_000;

export type BuildState =
  | { status: "idle" }
  | { status: "building"; revision: number }
  | { status: "built"; revision: number; result: Extract<BuildResponse, { ok: true }> }
  | { status: "failed"; revision: number; error: string };

/**
 * Builds a revision of the package in a worker. A result only counts for the
 * revision it was built from, and Cancel or a timeout terminates the worker,
 * since a WASM build can't be interrupted any other way.
 */
export function useBuild(revision: number) {
  const [state, setState] = useState<BuildState>({ status: "idle" });
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    worker.current?.terminate();
    worker.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const build = useCallback(
    (files: Record<string, string>) => {
      clearTimeout(timer.current);
      worker.current ??= new Worker("/move/compiler.worker.js", { type: "module" });
      worker.current.onmessage = ({ data }: MessageEvent<BuildResponse>) => {
        clearTimeout(timer.current);
        setState((current) => {
          if (current.status !== "building" || current.revision !== data.revision) return current;
          return data.ok
            ? { status: "built", revision: data.revision, result: data }
            : { status: "failed", revision: data.revision, error: data.error };
        });
      };
      timer.current = setTimeout(() => {
        stop();
        setState({ status: "failed", revision, error: "The build took over a minute, so it was stopped. Try again." });
      }, TIMEOUT_MS);
      setState({ status: "building", revision });
      worker.current.postMessage({ revision, files } satisfies BuildRequest);
    },
    [revision, stop],
  );

  const cancel = useCallback(() => {
    stop();
    setState({ status: "idle" });
  }, [stop]);

  // A result for an older revision describes code that's no longer on screen
  const current: BuildState = state.status !== "idle" && state.revision !== revision ? { status: "idle" } : state;
  return { state: current, build, cancel };
}

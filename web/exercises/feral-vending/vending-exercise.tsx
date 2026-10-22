"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Field, Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import { generate, nodeIds, starterQuantities, validateQuantity, type NodeId, type Quantities } from "./generate";
import { fixtures } from "./package";
import { useBuild } from "./use-build";

// ReactFlow measures the DOM, so the canvas renders in the browser only
const Flow = dynamic(() => import("./flow").then((mod) => mod.Flow), {
  ssr: false,
  loading: () => <div className="grid h-[26rem] place-items-center border border-line text-step--1 text-muted">Loading the flow…</div>,
});

const titles: Record<NodeId, string> = {
  exchange: "Exchange",
  accept: `Accept ${fixtures.feralData.label}`,
  dispense: `Dispense ${fixtures.eu40.label}`,
  complete: "Complete exchange",
  payment: "Payment quantity",
  reward: "Reward quantity",
};

const details: Partial<Record<NodeId, string>> = {
  accept: `Fixture item ${fixtures.feralData.typeId}`,
  dispense: `Fixture item ${fixtures.eu40.typeId}`,
};

export type VendingExerciseProps = {
  /** Learner-facing text, all of it from the lesson's exercise block. */
  config: { title?: string; intro?: string; nodes?: Partial<Record<NodeId, string>> };
};

/** The Feral Data vending machine: a fixed flow, its generated Move, and a real build in a worker. */
export function VendingExercise({ config }: VendingExerciseProps) {
  const [quantities, setQuantities] = useState<Quantities>(starterQuantities);
  const [selected, setSelected] = useState<NodeId>("accept");
  const [revision, setRevision] = useState(0);
  const [lastValid, setLastValid] = useState<Quantities>(starterQuantities);

  const errors = { payment: validateQuantity(quantities.payment), reward: validateQuantity(quantities.reward) };
  const valid = !errors.payment && !errors.reward;
  const generated = useMemo(() => generate(lastValid), [lastValid]);
  const { state, build, cancel } = useBuild(revision);

  const setQuantity = (id: "payment" | "reward", value: string) => {
    const next = { ...quantities, [id]: value };
    setQuantities(next);
    setRevision((r) => r + 1);
    if (!validateQuantity(next.payment) && !validateQuantity(next.reward)) setLastValid(next);
  };

  const reset = () => {
    setQuantities(starterQuantities);
    setLastValid(starterQuantities);
    setRevision((r) => r + 1);
  };

  const explanation = config.nodes?.[selected];
  const constant = selected === "payment" || selected === "reward" ? selected : null;

  return (
    <Plate as="section" aria-labelledby="exercise-title" corners="tr-bl" className="mt-m px-s py-m">
      <p className="font-heading text-step--2 font-bold tracking-[0.04em] text-muted uppercase">Exercise</p>
      <h3 id="exercise-title" className="mt-2xs text-step-1">{config.title ?? titles.exchange}</h3>
      {config.intro && <p className="mt-2xs text-step--1">{config.intro}</p>}

      <div role="group" aria-label="Nodes" className="mt-s flex flex-wrap gap-1">
        {nodeIds.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === selected}
            onClick={() => setSelected(id)}
            className={cn(
              "min-h-8 border px-2xs text-step--2 font-bold",
              id === selected ? "border-accent bg-tint-background text-tint-text" : "border-line text-muted hover:text-foreground",
            )}
          >
            {titles[id]}
          </button>
        ))}
      </div>

      <div className="mt-s grid gap-s lg:grid-cols-2 [&>*]:min-w-0">
        <Flow
          titles={titles}
          details={details}
          quantities={quantities}
          invalid={{ payment: Boolean(errors.payment), reward: Boolean(errors.reward) }}
          selected={selected}
          onSelect={setSelected}
        />
        <Source source={generated.source} highlight={generated.lines[selected] ?? []} stale={!valid} />
      </div>

      <div className="mt-s border border-line p-s">
        <h4 className="text-step-0">{titles[selected]}</h4>
        {explanation && <p className="mt-2xs text-step--1">{explanation}</p>}
        {constant && (
          <div className="mt-xs">
            <label htmlFor="quantity" className="text-step--2 font-bold text-muted">Value (u64)</label>
            <Field
              id="quantity"
              type="text"
              inputMode="numeric"
              placeholder="A whole number"
              value={quantities[constant]}
              onChange={(event) => setQuantity(constant, event.target.value)}
              aria-invalid={Boolean(errors[constant])}
              aria-describedby={errors[constant] ? "quantity-error" : undefined}
              className="mt-3xs max-w-60"
            />
            {errors[constant] && <p id="quantity-error" className="mt-3xs text-step--2 text-danger">{errors[constant]}</p>}
          </div>
        )}
      </div>

      <div className="mt-s flex flex-wrap items-center gap-xs">
        <Button onClick={() => build(generated.files)} disabled={!valid} loading={state.status === "building"}>
          Build
        </Button>
        {state.status === "building" && <Button variant="secondary" onClick={cancel}>Cancel</Button>}
        <Button variant="secondary" size="sm" onClick={reset}>Reset to starter</Button>
      </div>

      <BuildStatus state={state} valid={valid} />
    </Plate>
  );
}

function Source({ source, highlight, stale }: { source: string; highlight: number[]; stale: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const lines = source.trimEnd().split("\n");
  const first = highlight[0];

  // Scroll the selected node's first line into the panel, without moving the page
  useEffect(() => {
    const box = scroller.current;
    const line = box?.querySelector<HTMLElement>(`[data-line="${first}"]`);
    if (box && line) box.scrollTo({ top: line.offsetTop - box.clientHeight / 3, behavior: "smooth" });
  }, [first]);

  return (
    <div className="flex h-[26rem] flex-col border border-line">
      <p className="flex items-center justify-between border-b border-line bg-card px-xs py-3xs text-step--2 text-muted">
        <span className="font-bold">sources/vending.move</span>
        <span>Highlighted: the selected node · Plain: shared scaffolding</span>
      </p>
      {stale && (
        <p role="status" className="border-b border-danger px-xs py-3xs text-step--2 text-danger">
          Fix the value to update the code. This is the last valid version.
        </p>
      )}
      <div ref={scroller} tabIndex={0} aria-label="Generated Move source" className="relative grow overflow-auto font-mono text-step--2 leading-relaxed">
        {lines.map((text, i) => {
          const n = i + 1;
          const on = highlight.includes(n);
          return (
            <div key={n} data-line={n} className={cn("flex", on && "bg-tint-background text-tint-text")}>
              <span aria-hidden="true" className={cn("w-10 shrink-0 pr-2xs text-right select-none", on ? "border-l-2 border-accent" : "text-muted")}>
                {n}
              </span>
              <code className="pr-xs whitespace-pre">{text || " "}</code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BuildStatus({ state, valid }: { state: ReturnType<typeof useBuild>["state"]; valid: boolean }) {
  return (
    <div role="status" aria-live="polite" className="mt-xs text-step--1">
      {!valid && <p className="text-danger">Fix the highlighted value before building.</p>}
      {valid && state.status === "idle" && <p className="text-muted">Not built yet. Build compiles the code shown above.</p>}
      {state.status === "building" && <p className="text-muted">Building… the first build loads the compiler (about 7 MB).</p>}
      {state.status === "built" && (
        <div>
          <p className="font-bold">Built, not deployed</p>
          <p className="mt-3xs text-step--2 text-muted">
            {state.result.bytes} bytes of bytecode · digest {state.result.digest.slice(0, 16)}… · Sui {state.result.suiVersion} via
            @zktx.io/sui-move-builder 0.5.1 · against a teaching stub of the world contracts. Nothing was published or run.
          </p>
        </div>
      )}
      {state.status === "failed" && (
        <div>
          <p className="font-bold text-danger">Build failed</p>
          <pre className="mt-3xs max-h-60 overflow-auto bg-card p-xs font-mono text-step--2 whitespace-pre-wrap">{state.error}</pre>
        </div>
      )}
    </div>
  );
}

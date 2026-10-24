"use client";

import { useId, type ReactNode } from "react";
import { Plate } from "@/components/ui/plate";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { validateU64 } from "./u64.mjs";
import styles from "./nodes.module.css";

export const operationRoles = ["Exchange", "Accept Feral Data", "Dispense EU-40", "Complete exchange"] as const;
export type OperationRole = (typeof operationRoles)[number];

export function Socket({ direction, connected = false }: { direction: "in" | "out"; connected?: boolean }) {
  return <span className={styles.socketLabel}>
    <span aria-hidden="true">○</span> {direction === "in" ? "Quantity in" : "Value out"} · u64 · {connected ? "Connected" : "Unconnected"}
  </span>;
}

function NodeShell({ title, selected, onSelect, children, ports }: {
  title: string; selected?: boolean; onSelect?: () => void; children: ReactNode; ports?: ReactNode;
}) {
  return <section className={cn(styles.node, selected && styles.selected)} aria-label={title}>
    <Plate className={styles.surface}>
      <div className={styles.heading}>{title}</div>
      {onSelect && <div className="nodrag nopan">
        <Button variant="secondary" size="sm" onClick={onSelect} aria-pressed={!!selected}>
          {selected ? "✓ Tracing source" : "Trace source"}
        </Button>
      </div>}
      {selected && !onSelect && <p>✓ Selected</p>}
      {children}
    </Plate>
    {/* ReactFlow handles must be siblings of the clipped Plate. */}
    {ports}
  </section>;
}

export function PrimitiveConstant({ name = "CONSTANT_A", value, onChange, selected, onSelect, connected, ports }: {
  name?: string; value: string; onChange: (text: string) => void; selected?: boolean;
  onSelect?: () => void; connected?: boolean; ports?: ReactNode;
}) {
  const id = useId();
  const { error } = validateU64(value);
  return <NodeShell title={name} selected={selected} onSelect={onSelect} ports={ports}>
    <p>Primitive Constant · u64</p>
    <div className="nodrag nopan">
      <Field type="text" inputMode="numeric" placeholder="Decimal u64"
        aria-label={name + " value"} value={value} onChange={event => onChange(event.target.value)}
        aria-invalid={!!error} aria-describedby={id} />
    </div>
    <p id={id} className={error ? styles.error : styles.hint}>
      {error ? "Error: " + error : "Copyable value · zero is valid u64"}
    </p>
    <Socket direction="out" connected={connected} />
  </NodeShell>;
}

export function OperationNode({ role, connected, selected, onSelect, ports }: {
  role: OperationRole; connected?: boolean; selected?: boolean; onSelect?: () => void; ports?: ReactNode;
}) {
  const quantity = role === "Accept Feral Data" || role === "Dispense EU-40";
  return <NodeShell title={role} selected={selected} onSelect={quantity ? onSelect : undefined} ports={ports}>
    <p className={styles.execution}>▸ Execution flow · locked</p>
    {quantity ? <>
      <p className={styles.hint}>Fixture data: {role === "Accept Feral Data" ? "Feral Data / payment storage" : "EU-40 / reward storage"}</p>
      <Socket direction="in" connected={connected} />
    </> : <p className={styles.hint}>{role === "Exchange" ? "Begin fixed sequence" : "End fixed sequence"} · no source mapping</p>}
  </NodeShell>;
}

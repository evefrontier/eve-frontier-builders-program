"use client";

import { useMemo, useState } from "react";
import {
  Background,
  Handle,
  Position,
  ReactFlow,
  applyNodeChanges,
  type Edge,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { cn } from "@/lib/cn";
import type { NodeId, Quantities } from "./generate";
import styles from "./flow.module.css";

export type VendingNodeData = {
  title: string;
  kind: "step" | "constant";
  detail?: string;
  value?: string;
  takesQuantity?: boolean;
  invalid?: boolean;
  selected: boolean;
};

type VendingNode = Node<VendingNodeData, "vending">;

function VendingNodeView({ data }: NodeProps<VendingNode>) {
  return (
    <div
      data-kind={data.kind}
      data-selected={data.selected || undefined}
      data-invalid={data.invalid || undefined}
      className={cn("min-w-40 px-xs py-2xs text-step--2", styles.node)}
    >
      {data.kind === "step" ? (
        <>
          <Handle type="target" position={Position.Left} className={styles.flowHandle} />
          {data.takesQuantity && (
            <Handle type="target" id="quantity" position={Position.Bottom} className={styles.valueHandle} />
          )}
          <Handle type="source" position={Position.Right} className={styles.flowHandle} />
        </>
      ) : (
        <Handle type="source" position={Position.Top} className={styles.valueHandle} />
      )}
      <p className="font-heading font-bold tracking-[0.04em] text-muted uppercase">
        {data.kind === "constant" ? "Primitive constant" : "Step"}
      </p>
      <p className="mt-3xs text-step--1 font-bold text-foreground">{data.title}</p>
      {data.detail && <p className="mt-3xs text-muted">{data.detail}</p>}
      {data.kind === "constant" && (
        <p className="mt-3xs font-mono text-foreground">
          u64 = <span className={data.invalid ? "text-danger" : undefined}>{data.value || "—"}</span>
        </p>
      )}
    </div>
  );
}

const nodeTypes = { vending: VendingNodeView };

const layout: Record<NodeId, { x: number; y: number }> = {
  exchange: { x: 0, y: 0 },
  accept: { x: 220, y: 0 },
  dispense: { x: 440, y: 0 },
  complete: { x: 660, y: 0 },
  payment: { x: 220, y: 170 },
  reward: { x: 440, y: 170 },
};

const edges: Edge[] = [
  { id: "exchange-accept", source: "exchange", target: "accept" },
  { id: "accept-dispense", source: "accept", target: "dispense" },
  { id: "dispense-complete", source: "dispense", target: "complete" },
  { id: "payment-accept", source: "payment", target: "accept", targetHandle: "quantity", className: styles.valueEdge },
  { id: "reward-dispense", source: "reward", target: "dispense", targetHandle: "quantity", className: styles.valueEdge },
];

export type FlowProps = {
  titles: Record<NodeId, string>;
  details: Partial<Record<NodeId, string>>;
  quantities: Quantities;
  invalid: Partial<Record<NodeId, boolean>>;
  selected: NodeId;
  onSelect: (id: NodeId) => void;
};

/**
 * The exercise's fixed graph. Nodes can be moved and selected but not
 * connected, removed or added, and positions never reach the generated code.
 */
export function Flow({ titles, details, quantities, invalid, selected, onSelect }: FlowProps) {
  // ReactFlow keeps measured sizes on the node objects, so they live in state;
  // the data on them is derived fresh each render
  const [state, setState] = useState<VendingNode[]>(() =>
    (Object.keys(layout) as NodeId[]).map((id) => ({ id, type: "vending", position: layout[id], data: {} as VendingNodeData })),
  );

  const nodes = useMemo<VendingNode[]>(
    () =>
      state.map((node) => {
        const id = node.id as NodeId;
        const constant = id === "payment" || id === "reward";
        return {
          ...node,
          data: {
            title: titles[id],
            kind: constant ? "constant" : "step",
            detail: details[id],
            value: constant ? quantities[id] : undefined,
            takesQuantity: id === "accept" || id === "dispense",
            invalid: invalid[id],
            selected: id === selected,
          },
        };
      }),
    [state, titles, details, quantities, invalid, selected],
  );

  const onNodesChange = (changes: NodeChange<VendingNode>[]) => setState((current) => applyNodeChanges(changes, current));

  return (
    <div className={cn("h-[26rem]", styles.canvas)}>
      <ReactFlow<VendingNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => onSelect(node.id as NodeId)}
        nodesConnectable={false}
        edgesFocusable={false}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        aria-label="Vending machine flow"
      >
        <Background gap={20} size={1} color="var(--color-line)" />
      </ReactFlow>
    </div>
  );
}

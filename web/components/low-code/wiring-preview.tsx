"use client";

import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  ReactFlow, Handle, Position, MarkerType, applyNodeChanges, ConnectionMode,
  Background, BackgroundVariant, Controls, MiniMap, Panel,
  type Node, type NodeProps, type Edge, type Connection, type ReactFlowInstance,
} from "@xyflow/react";
import "./canvas.css";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  PrimitiveConstant,
  OperationNode,
  socketPortClassName,
  type OperationRole,
  type OperationHandleId,
} from "./nodes";
import {
  constantNames,
  consumerIds,
  executionSourceIds,
  executionTargetIds,
  initialConnections,
  connectValue,
  connectionError,
  disconnectValue,
  valueConnection,
  executionConnection,
  traceExecutionFlow,
  socketTypeMeta,
  type FlowConnection,
  type SocketType,
} from "./connections.mjs";
import { SourcePreview } from "./source-preview";
import styles from "./wiring-preview.module.css";

type PreviewData = {
  role?: OperationRole;
  item?: string;
  name?: string;
  dataType?: SocketType;
  value?: string;
  connected: boolean;
  execInConnected: boolean;
  execOutConnected: boolean;
  selected: boolean;
  highlighted: boolean;
  edit: (text: string) => void;
  rename?: (name: string) => void;
  retype?: (type: SocketType) => void;
  setFocused: Dispatch<SetStateAction<string | null>>;
};
type PreviewNode = Node<PreviewData, "preview">;

function CanvasNode({ id, data }: NodeProps<PreviewNode>) {
  // The focusable element is React Flow's wrapper, this node's parent
  const root = useRef<HTMLDivElement>(null);
  const { setFocused } = data;
  useEffect(() => {
    const wrapper = root.current?.parentElement;
    if (!wrapper) return;
    const enter = () => setFocused(id);
    const leave = () => setFocused(current => (current === id ? null : current));
    wrapper.addEventListener("focusin", enter);
    wrapper.addEventListener("focusout", leave);
    return () => {
      wrapper.removeEventListener("focusin", enter);
      wrapper.removeEventListener("focusout", leave);
    };
  }, [id, setFocused]);

  let node: ReactNode;
  if (!data.role) {
    const dataType = data.dataType ?? "u64";
    const displayName = data.name ?? id;
    node = (
      <PrimitiveConstant
        name={displayName}
        dataType={dataType}
        value={data.value ?? ""}
        onChange={data.edit}
        onNameChange={data.rename}
        onTypeChange={data.retype}
        selected={data.selected}
        highlighted={data.highlighted}
        connected={data.connected}
        handle={
          <Handle
            type="source"
            position={Position.Right}
            id="value"
            role="group"
            className={socketPortClassName({ direction: "out", type: dataType, connected: data.connected })}
            aria-label={`${displayName} ${dataType} value out`}
          />
        }
      />
    );
  } else {
    const handles: Partial<Record<OperationHandleId, ReactNode>> = {};
    if (data.role !== "Start Request") {
      handles["exec-in"] = (
        <Handle
          type="target"
          position={Position.Left}
          id="exec-in"
          role="group"
          className={socketPortClassName({ direction: "in", type: "execution", connected: data.execInConnected })}
          aria-label={`${data.role} Request in`}
        />
      );
    }
    if (data.role !== "Complete Request") {
      handles["exec-out"] = (
        <Handle
          type="source"
          position={Position.Right}
          id="exec-out"
          role="group"
          className={socketPortClassName({ direction: "out", type: "execution", connected: data.execOutConnected })}
          aria-label={`${data.role} Request out`}
        />
      );
    }
    if (data.role === "Require Item" || data.role === "Transfer Item") {
      handles.quantity = (
        <Handle
          type="target"
          position={Position.Left}
          id="quantity"
          role="group"
          className={socketPortClassName({ direction: "in", type: "u64", connected: data.connected })}
          aria-label={`${data.role} u64 Quantity in`}
        />
      );
    }
    node = (
      <OperationNode
        role={data.role}
        item={data.item}
        connected={data.connected}
        execInConnected={data.execInConnected}
        execOutConnected={data.execOutConnected}
        selected={data.selected}
        highlighted={data.highlighted}
        handles={handles}
      />
    );
  }

  return <div ref={root}>{node}</div>;
}

const nodeTypes = { preview: CanvasNode };

const operations: { id: string; role: OperationRole; item?: string }[] = [
  { id: "start", role: "Start Request" },
  { id: "require", role: "Require Item", item: "FERAL_DATA" },
  { id: "transfer", role: "Transfer Item", item: "EU_40" },
  { id: "complete", role: "Complete Request" },
];

const nodeIds = [...constantNames, ...operations.map(op => op.id)];

export const initialNodePositions: Record<string, { x: number; y: number }> = {
  // Top tier for Constants: placed upstream/left of consumer so value wires flow smoothly from left-to-right
  CONSTANT_A: { x: 160, y: 30 },
  CONSTANT_B: { x: 640, y: 30 },
  // Bottom tier for Operations: linear execution flow from left to right along the bottom
  start: { x: 40, y: 340 },
  require: { x: 520, y: 340 },
  transfer: { x: 1000, y: 340 },
  complete: { x: 1480, y: 340 },
};

const initialNodes: PreviewNode[] = nodeIds.map(id => ({
  id,
  type: "preview" as const,
  position: initialNodePositions[id] ?? { x: 0, y: 0 },
  data: {} as PreviewData,
}));

const STARTER_VALUES = { CONSTANT_A: "10", CONSTANT_B: "40" };
const STARTER_NAMES = { CONSTANT_A: "CONSTANT_A", CONSTANT_B: "CONSTANT_B" };
const STARTER_TYPES: Record<string, SocketType> = { CONSTANT_A: "u64", CONSTANT_B: "u64" };

export type WiringPreviewProps = {
  initialConnections?: FlowConnection[];
  showCodePreview?: boolean;
  showControls?: boolean;
  canvasOnly?: boolean;
};

export function WiringPreview({
  initialConnections: customConnections,
  showCodePreview = true,
  showControls = true,
  canvasOnly = false,
}: WiringPreviewProps) {
  const [values, setValues] = useState<Record<string, string>>(STARTER_VALUES);
  const [customNames, setCustomNames] = useState<Record<string, string>>(STARTER_NAMES);
  const [customTypes, setCustomTypes] = useState<Record<string, SocketType>>(STARTER_TYPES);
  const [connections, setConnections] = useState<FlowConnection[]>(() => customConnections ?? initialConnections());
  const [layout, setLayout] = useState(initialNodes);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  // Edges are controlled too, so Enter, Escape and clicks on a wire arrive as changes
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [source, setSource] = useState<string>("CONSTANT_A");
  const [target, setTarget] = useState<string>("require");
  const [execSource, setExecSource] = useState<string>("start");
  const [execTarget, setExecTarget] = useState<string>("require");
  const [feedback, setFeedback] = useState(
    "Hover over any block to illuminate its connections and partner blocks. Click to pin Move source inspection.",
  );

  // React Flow owns selection: click, Enter and Escape all arrive as node changes
  const selection = layout.find(node => node.selected)?.id ?? null;

  // React Flow pans to a focused node but not to a focused wire, which can sit
  // off-screen, so bring both of its ends into view at the current zoom
  const flow = useRef<ReactFlowInstance<PreviewNode, Edge> | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  function revealFocusedWire(event: React.FocusEvent<HTMLDivElement>) {
    const id = (event.target as Element).closest(".react-flow__edge")?.getAttribute("data-id");
    const edge = id ? edges.find(entry => entry.id === id) : undefined;
    if (!edge || !flow.current) return;
    const { zoom } = flow.current.getViewport();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    flow.current.fitView({
      nodes: [{ id: edge.source }, { id: edge.target }],
      minZoom: zoom,
      maxZoom: zoom,
      duration: reduce ? 0 : 200,
    });
  }
  const activeId = hovered ?? focused ?? selection;

  const displayName = (id: string) => customNames[id] ?? operations.find(op => op.id === id)?.role ?? id;

  function updateConstantName(id: string, name: string) {
    setCustomNames(current => ({ ...current, [id]: name }));
    setFeedback(`Renamed constant to ${name}.`);
  }

  function updateConstantType(id: string, type: SocketType) {
    setCustomTypes(current => ({ ...current, [id]: type }));
    // Only u64 can feed a quantity, so a retyped constant drops its wires
    if (type !== "u64") {
      setConnections(current => current.filter(edge => !(edge.source === id && edge.sourceHandle === "value")));
    }
    setFeedback(`Changed ${customNames[id] ?? id} type to ${type}.`);
  }

  // Canvas and labelled controls use these same mutation functions.
  function connect(connection: Connection) {
    const normalized = {
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
    };
    const result = connectValue(connections, normalized, customTypes);
    setConnections(result.edges);
    setFeedback(
      result.error ??
        `Connected ${customNames[normalized.source] ?? normalized.source} (${normalized.sourceHandle}) → ${normalized.target} (${normalized.targetHandle}).`,
    );
  }

  function disconnect(input: string, handle: "quantity" | "exec-in" = "quantity") {
    setConnections(current => disconnectValue(current, input, handle));
    setFeedback(
      handle === "quantity"
        ? `${input} u64 quantity disconnected; no default substituted.`
        : `${input} execution Request in disconnected.`,
    );
  }

  function swapExecutionOrder() {
    const valueEdges = connections.filter(edge => edge.targetHandle === "quantity");
    const isDefaultOrder = traceExecutionFlow(connections).steps.join("->") === "start->require->transfer->complete";
    const order = isDefaultOrder ? ["start", "transfer", "require", "complete"] : ["start", "require", "transfer", "complete"];
    const nextExec = order.slice(1).map((id, index) => executionConnection(order[index], id));
    setConnections([...nextExec, ...valueEdges]);
    setFeedback(
      isDefaultOrder
        ? "Execution flow rewired: Start Request → Transfer Item → Require Item → Complete Request."
        : "Execution flow rewired: Start Request → Require Item → Transfer Item → Complete Request.",
    );
  }

  function resetStarterFlow() {
    setConnections(initialConnections());
    setValues(STARTER_VALUES);
    setCustomNames(STARTER_NAMES);
    setCustomTypes(STARTER_TYPES);
    setHovered(null);
    setFocused(null);
    setLayout(initialNodes);
    setFeedback("Reset to default starter flow with clean non-overlapping layout.");
  }

  const nodes: PreviewNode[] = layout.map(node => {
    const op = operations.find(entry => entry.id === node.id);
    const connected = op
      ? connections.some(edge => edge.target === node.id && edge.targetHandle === "quantity")
      : connections.some(edge => edge.source === node.id && edge.sourceHandle === "value");
    const partner = Boolean(
      activeId &&
        connections.some(
          edge =>
            (edge.source === activeId && edge.target === node.id) ||
            (edge.target === activeId && edge.source === node.id),
        ),
    );
    const data: PreviewData = {
      role: op?.role,
      item: op?.item,
      name: customNames[node.id],
      dataType: customTypes[node.id],
      value: values[node.id],
      connected,
      execInConnected: connections.some(edge => edge.target === node.id && edge.targetHandle === "exec-in"),
      execOutConnected: connections.some(edge => edge.source === node.id && edge.sourceHandle === "exec-out"),
      selected: node.id === activeId,
      // Partner rings follow the pointer only, so keyboard focus lights one card
      highlighted: hovered !== null && partner,
      edit: (text: string) => setValues(current => ({ ...current, [node.id]: text })),
      rename: (name: string) => updateConstantName(node.id, name),
      retype: (type: SocketType) => updateConstantType(node.id, type),
      setFocused,
    };
    return {
      ...node,
      deletable: false,
      ariaLabel: op?.role ?? customNames[node.id] ?? node.id,
      data,
    };
  });

  const edges: Edge[] = connections.map(edge => {
        const isExec = edge.sourceHandle === "exec-out" && edge.targetHandle === "exec-in";
        const isTraced = Boolean(activeId && (edge.source === activeId || edge.target === activeId));
        const kind = isExec ? "execution request" : "u64 quantity";
        return {
          ...edge,
          id: `${edge.source}-${edge.sourceHandle}-${edge.target}-${edge.targetHandle}`,
          type: isExec ? "smoothstep" : "default",
          className: cn(isExec ? styles.executionEdge : styles.u64Edge, isTraced && styles.tracedEdge),
          animated: isTraced,
          selected: `${edge.source}-${edge.sourceHandle}-${edge.target}-${edge.targetHandle}` === selectedEdge,
          deletable: true,
          reconnectable: false,
          markerEnd: isExec ? { type: MarkerType.ArrowClosed, color: "var(--color-socket-execution)" } : undefined,
          ariaLabel: `${edge.source} to ${edge.target} ${kind}${isTraced ? " (connected)" : ""}`,
        };
      });

  const execSummary = traceExecutionFlow(connections);
  const quantitySource = (id: string) =>
    connections.find(edge => edge.target === id && edge.targetHandle === "quantity")?.source;

  let activeTraceNotice: string | null = null;
  if (activeId && constantNames.some(name => name === activeId)) {
    const consumers = connections
      .filter(edge => edge.source === activeId && edge.sourceHandle === "value")
      .map(edge => operations.find(op => op.id === edge.target)?.role ?? edge.target);
    activeTraceNotice = consumers.length
      ? `${activeId} (u64): feeds ${consumers.join(", ")} · wire illuminated.`
      : `${activeId} (u64): currently unconnected.`;
  } else if (activeId) {
    const op = operations.find(entry => entry.id === activeId);
    const from = quantitySource(activeId);
    activeTraceNotice = from
      ? `${op?.role ?? activeId}: quantity supplied by ${from} · connected wires illuminated.`
      : `${op?.role ?? activeId}: linear execution flow illuminated.`;
  }

  const canvasElement = (
    <div ref={canvas} className={cn("relative h-170 min-w-0 border border-control-line bg-background", styles.canvas)} onFocus={revealFocusedWire}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={instance => {
          flow.current = instance;
        }}
        fitView
        minZoom={0.35}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={24}
        onNodesChange={changes =>
          setLayout(current => applyNodeChanges(changes.filter(change => change.type !== "remove"), current))
        }
        onNodeMouseEnter={(_, node) => setHovered(node.id)}
        onNodeMouseLeave={() => setHovered(null)}
        onConnect={connect}
        isValidConnection={connection =>
          connectionError(
            {
              ...connection,
              sourceHandle: connection.sourceHandle ?? null,
              targetHandle: connection.targetHandle ?? null,
            },
            connections,
            customTypes,
          ) === null
        }
        onConnectEnd={(_, state) => {
          if (state.isValid) return;
          if (state.fromNode && state.toNode) {
            const attempt = {
              source: state.fromNode.id,
              target: state.toNode.id,
              sourceHandle: state.fromHandle?.id ?? null,
              targetHandle: state.toHandle?.id ?? null,
            };
            setFeedback(connectionError(attempt, connections, customTypes) ?? "Connect matching socket types.");
          } else {
            setFeedback("Connection not made. Connect matching socket types (exec → exec or u64 → u64).");
          }
        }}
        onEdgesChange={changes => {
          for (const change of changes) {
            if (change.type === "select") {
              setSelectedEdge(current => (change.selected ? change.id : current === change.id ? null : current));
            } else if (change.type === "remove") {
              const edge = edges.find(entry => entry.id === change.id);
              if (edge?.targetHandle === "quantity" || edge?.targetHandle === "exec-in") {
                disconnect(edge.target, edge.targetHandle);
              }
              setSelectedEdge(current => (current === change.id ? null : current));
              // A deleted wire takes keyboard focus with it, so hand it to the node it fed
              if (edge && document.activeElement?.closest(".react-flow__edge")) {
                const target = `.react-flow__node[data-id="${edge.target}"]`;
                requestAnimationFrame(() => canvas.current?.querySelector<HTMLElement>(target)?.focus());
              }
            }
          }
        }}
        edgesReconnectable={false}
        deleteKeyCode={["Backspace", "Delete"]}
        aria-label="Illustrative Move primitive wiring canvas"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="var(--color-line)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={node => {
            if (!node.data.role) return `var(--color-socket-${node.data.dataType ?? "u64"})`;
            if (node.data.role === "Start Request" || node.data.role === "Complete Request") {
              return "var(--color-socket-execution)";
            }
            return "var(--color-socket-item)";
          }}
        />
        <Panel position="top-left">
          <div className="inline-flex items-center gap-2 border border-line bg-card px-3 py-1.5 font-heading text-step--2 tracking-[0.06em] uppercase">
            <span className="size-2 rounded-full bg-socket-u64 ring-[3px] ring-socket-u64/30" aria-hidden="true" />
            ReactFlow Interactive Canvas
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );

  if (canvasOnly) return canvasElement;

  return (
    <div className="grid gap-5 text-foreground">
      <h2 className="text-step-1">Typed Move/SDK Primitives &amp; Wireable Execution Flow</h2>
      <p>
        Working ReactFlow example. Move/SDK primitives (<code>entity::start_request</code>,{" "}
        <code>inventory::require_item</code>, <code>inventory::transfer_item</code>,{" "}
        <code>request::complete_request</code>) with colour-coded typed sockets. Hover over any block
        to inspect its connections and partner blocks. Click to pin Move source inspection.
      </p>

      <ul className="flex flex-wrap items-center gap-x-5 gap-y-3 border border-line bg-card px-3.5 py-2.5 text-step--2" aria-label="Socket type legend">
        {(
          [
            ["execution", "Linear Request flow (dashed arrow)", "text-socket-execution"],
            ["u64", "Copyable u64 integer (solid line)", "text-socket-u64"],
            ["item", "Item / Entity fixture", "text-socket-item"],
            ["boolean", "Boolean predicate", "text-socket-boolean"],
          ] as const
        ).map(([type, text, colour]) => (
          <li key={type} className="inline-flex items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 border border-current px-1.5 font-heading text-step--3 font-bold uppercase", colour)}>
              {socketTypeMeta[type].glyph} {socketTypeMeta[type].badge}
            </span>
            {text}
          </li>
        ))}
      </ul>

      {canvasElement}

      {showControls && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          <fieldset className="flex flex-wrap items-end gap-4 border border-line p-4">
            <legend className="px-1.5 font-heading text-step--2 font-bold">u64 Value connections · keyboard or pointer</legend>
            <label className="grid gap-2 text-step--1">
              Primitive Constant
              <select className={SELECT} value={source} onChange={event => setSource(event.target.value)}>
                {constantNames.map(name => (
                  <option key={name} value={name}>{displayName(name)}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-step--1">
              Quantity input
              <select className={SELECT} value={target} onChange={event => setTarget(event.target.value)}>
                <option value="require">Require Item (FERAL_DATA) · u64 in</option>
                <option value="transfer">Transfer Item (EU_40) · u64 in</option>
              </select>
            </label>
            <Button onClick={() => connect(valueConnection(source, target))}>Connect u64</Button>
            <Button variant="secondary" onClick={() => disconnect(target, "quantity")}>
              Disconnect u64
            </Button>
          </fieldset>

          <fieldset className="flex flex-wrap items-end gap-4 border border-line p-4">
            <legend className="px-1.5 font-heading text-step--2 font-bold">Execution flow · linear Request order</legend>
            <label className="grid gap-2 text-step--1">
              Request out
              <select className={SELECT} value={execSource} onChange={event => setExecSource(event.target.value)}>
                {executionSourceIds.map(id => (
                  <option key={id} value={id}>{displayName(id)} ({id})</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-step--1">
              Request in
              <select className={SELECT} value={execTarget} onChange={event => setExecTarget(event.target.value)}>
                {executionTargetIds.map(id => (
                  <option key={id} value={id}>{displayName(id)} ({id})</option>
                ))}
              </select>
            </label>
            <Button onClick={() => connect(executionConnection(execSource, execTarget))}>Connect exec</Button>
            <Button variant="secondary" onClick={() => disconnect(execTarget, "exec-in")}>
              Disconnect exec
            </Button>
            <Button variant="secondary" onClick={swapExecutionOrder}>Swap Order</Button>
            <Button variant="secondary" onClick={resetStarterFlow}>Reset Flow</Button>
          </fieldset>
        </div>
      )}

      <p role="status">
        {feedback}
        {activeTraceNotice && <strong className="mt-1 block">{activeTraceNotice}</strong>}
      </p>
      <ul>
        <li>
          Execution chain: {execSummary.steps.join(" → ")}{" "}
          {execSummary.error ? `(incomplete: ${execSummary.error})` : "(complete)"}
        </li>
        {consumerIds.map(id => {
          const from = quantitySource(id);
          return (
            <li key={id}>
              {id} quantity: {from ? (customNames[from] ?? from) : "Unconnected"}
            </li>
          );
        })}
      </ul>
      {showCodePreview && (
        <SourcePreview
          values={values}
          connections={connections}
          selection={activeId}
          customNames={customNames}
          customTypes={customTypes}
        />
      )}
      <p>
        Zero is valid u64 here, not a promise of valid exercise payment. No wallet, RPC, inventory enforcement or compiler.
      </p>
    </div>
  );
}

const SELECT = cn(
  "border border-control-line bg-card p-2 text-foreground",
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-foreground",
  "forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
);

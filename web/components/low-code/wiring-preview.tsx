"use client";

import { useState } from "react";
import {
  ReactFlow, Handle, Position, MarkerType, applyNodeChanges, ConnectionMode,
  type Node, type NodeProps, type Edge, type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { PrimitiveConstant, OperationNode, type OperationRole } from "./nodes";
import {
  constantNames, consumerIds, initialConnections, connectValue, connectionError,
  disconnectValue, valueConnection,
} from "./connections.mjs";
import { SourcePreview } from "./source-preview";
import styles from "./wiring-preview.module.css";

type PreviewData = {
  role?: OperationRole; value?: string; connected: boolean; tracing: boolean;
  edit: (text: string) => void; trace: () => void;
};
type PreviewNode = Node<PreviewData, "preview">;

function CanvasNode({ id, data }: NodeProps<PreviewNode>) {
  const constant = !data.role;
  const quantity = data.role === "Accept Feral Data" || data.role === "Dispense EU-40";
  const ports = constant
    ? <Handle type="source" position={Position.Right} id="value" role="group" style={{ top: "85%" }} aria-label={id + " u64 Value out"} />
    : <>
      {data.role !== "Exchange" && <Handle className={styles.executionHandle} type="target" position={Position.Left} id="exec-in" style={{ top: 35 }} isConnectable={false} />}
      {data.role !== "Complete exchange" && <Handle className={styles.executionHandle} type="source" position={Position.Right} id="exec-out" style={{ top: 35 }} isConnectable={false} />}
      {quantity && <Handle type="target" position={Position.Left} id="quantity" role="group" style={{ top: "85%" }} aria-label={data.role + " u64 Quantity in"} />}
    </>;
  return constant
    ? <PrimitiveConstant name={id} value={data.value ?? ""} onChange={data.edit} selected={data.tracing} onSelect={data.trace} connected={data.connected} ports={ports} />
    : <OperationNode role={data.role!} connected={data.connected} selected={data.tracing} onSelect={data.trace} ports={ports} />;
}
const nodeTypes = { preview: CanvasNode };
const roles: [string, OperationRole][] = [
  ["exchange", "Exchange"], ["accept", "Accept Feral Data"],
  ["dispense", "Dispense EU-40"], ["complete", "Complete exchange"],
];
const executionEdges: Edge[] = roles.slice(0, -1).map(([source], index) => ({
  id: "exec-" + source, source, target: roles[index + 1][0],
  sourceHandle: "exec-out", targetHandle: "exec-in", type: "smoothstep",
  selectable: false, deletable: false, reconnectable: false,
  className: styles.executionEdge,
  markerEnd: { type: MarkerType.ArrowClosed, color: "var(--color-foreground)" },
}));
const initialNodes: PreviewNode[] = [
  ...constantNames.map((id, index) => ({ id, type: "preview" as const, position: { x: 360 + index * 370, y: 0 }, data: {} as PreviewData })),
  ...roles.map(([id], index) => ({ id, type: "preview" as const, position: { x: index * 350, y: 390 }, data: {} as PreviewData })),
];

export function WiringPreview() {
  const [values, setValues] = useState<Record<string, string>>({ CONSTANT_A: "10", CONSTANT_B: "40" });
  const [connections, setConnections] = useState(initialConnections);
  const [layout, setLayout] = useState(initialNodes);
  const [selection, setSelection] = useState<string | null>("CONSTANT_A");
  const [source, setSource] = useState<string>("CONSTANT_A");
  const [target, setTarget] = useState<string>("accept");
  const [feedback, setFeedback] = useState("Two independent constants connected. Disconnect Dispense, then connect CONSTANT_A to discover reuse.");

  // Canvas and labelled controls use exactly these same mutation functions.
  function connect(connection: Connection) {
    const result = connectValue(connections, connection);
    setConnections(result.edges);
    setFeedback(result.error ?? "Connected " + connection.source + " → " + connection.target + " quantity.");
  }
  function disconnect(input: string) {
    setConnections(current => disconnectValue(current, input));
    setFeedback(input + " quantity disconnected; no default substituted.");
  }
  const nodes = layout.map(node => ({
    ...node,
    deletable: false,
    data: {
      role: roles.find(([id]) => id === node.id)?.[1],
      value: values[node.id],
      connected: connections.some(edge => edge.source === node.id || edge.target === node.id),
      tracing: selection === node.id,
      edit: (text: string) => setValues(current => ({ ...current, [node.id]: text })),
      trace: () => setSelection(node.id),
    },
  }));
  const edges: Edge[] = [
    ...executionEdges,
    ...connections.map(edge => ({
      ...edge, id: edge.source + "-" + edge.target,
      className: styles.valueEdge, deletable: true, reconnectable: false,
      ariaLabel: edge.source + " to " + edge.target + " u64 quantity",
    })),
  ];

  return <div className={styles.preview}>
    <h2 className="text-step-1">Trace a shared Primitive Constant</h2>
    <p>UI-only preview. Dashed arrows: locked Execution flow. Solid lines / circles: editable u64 Value connections.
      Disconnect Dispense, connect CONSTANT_A to it, then edit or trace CONSTANT_A.</p>
    <div className={styles.canvas}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.35}
        connectionMode={ConnectionMode.Loose}
        onNodesChange={changes => setLayout(current => applyNodeChanges(changes.filter(change => change.type !== "remove"), current))}
        onNodeClick={(_, node) => {
          if (constantNames.some(name => name === node.id) || consumerIds.some(id => id === node.id)) setSelection(node.id);
        }}
        onConnect={connect}
        isValidConnection={connection => connectionError({ ...connection, sourceHandle: connection.sourceHandle ?? null, targetHandle: connection.targetHandle ?? null }, connections) === null}
        onConnectEnd={(_, state) => {
          if (!state.isValid && state.fromNode && state.toNode) {
            const attempt = {
              source: state.fromNode.id, target: state.toNode.id,
              sourceHandle: state.fromHandle?.id ?? null, targetHandle: state.toHandle?.id ?? null,
            };
            setFeedback(connectionError(attempt, connections) ?? "Connect a Value out to a Quantity in.");
          } else if (!state.isValid) {
            setFeedback("Connection not made. Use a Primitive Constant's Value out and an available u64 Quantity in; Execution flow is locked.");
          }
        }}
        onEdgesChange={changes => {
          for (const change of changes) {
            if (change.type === "remove") {
              const edge = edges.find(edge => edge.id === change.id);
              if (edge?.targetHandle === "quantity") disconnect(edge.target);
            }
          }
        }}
        edgesReconnectable={false} deleteKeyCode={["Backspace", "Delete"]}
        aria-label="Illustrative constant wiring canvas"
      />
    </div>
    <fieldset className={styles.controls}>
      <legend>Value connections · keyboard or pointer</legend>
      <label>Primitive Constant
        <select value={source} onChange={event => setSource(event.target.value)}>
          {constantNames.map(name => <option key={name}>{name}</option>)}
        </select>
      </label>
      <label>Quantity input
        <select value={target} onChange={event => setTarget(event.target.value)}>
          <option value="accept">Accept Feral Data · u64 in</option>
          <option value="dispense">Dispense EU-40 · u64 in</option>
        </select>
      </label>
      <Button onClick={() => connect(valueConnection(source, target))}>Connect</Button>
      <Button variant="secondary" onClick={() => disconnect(target)}>Disconnect input</Button>
    </fieldset>
    <p role="status">{feedback}</p>
    <ul>{consumerIds.map(id => <li key={id}>{id} quantity: {connections.find(edge => edge.target === id)?.source ?? "Unconnected"}</li>)}</ul>
    <SourcePreview values={values} connections={connections} selection={selection} />
    <p>Zero is valid u64 here, not a promise of valid exercise payment. No wallet, RPC, inventory enforcement or compiler.</p>
  </div>;
}

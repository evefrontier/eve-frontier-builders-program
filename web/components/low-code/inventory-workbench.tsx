"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  getBezierPath,
  Handle,
  Position,
  type Connection,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import "./canvas.css";
import { Button, Icon, Plate, Tag } from "@/components/ui";
import { cn } from "@/lib/cn";
import { EXTERNAL } from "@/lib/external";
import {
  OperationNode,
  PrimitiveConstant,
  socketPortClassName,
  type CustomOperationSpec,
} from "./nodes";
import { SourcePreview } from "./source-preview";
import { generateInventoryRule } from "./inventory-generator.mjs";
import {
  ITEM_NODE_IDS,
  RULE_NODE_ID,
  SOURCE_HANDLE,
  TARGET_HANDLE,
  checkAnswer,
  decodeProgress,
  encodeProgress,
  evaluateCase,
  graphFor,
  initialState,
  progressFor,
  transition,
  type CaseEvaluation,
  type InventoryAction,
  type InventoryExerciseDefinition,
  type InventoryLessonState,
  type ItemNodeId,
} from "./inventory-exercise";
import wiringStyles from "./wiring-preview.module.css";

type InventoryNodeData = {
  kind: "item-type" | "deposit-rule";
  label: string;
  value?: string;
  iconSrc?: string;
  connected: boolean;
  selected: boolean;
};

type InventoryFlowNode = Node<InventoryNodeData, "inventory">;

const WORLD_CONTRACTS_COMMIT = "e1eff82e84f89d4ed66bbcfd5949c9f3a817bd99";
const DEPOSIT_REQUIREMENT_URL = `https://github.com/evefrontier/world-contracts/blob/${WORLD_CONTRACTS_COMMIT}/contracts/inventory/sources/inventory.move#L450-L461`;

const DEPOSIT_RULE_SPEC: CustomOperationSpec = {
  title: "Deposit rule",
  symbol: "inventory::deposit_requirement",
  symbolHref: DEPOSIT_REQUIREMENT_URL,
  summary: "Allow deposits matching the connected item type.",
  accent: "u64",
  inputs: [{ id: TARGET_HANDLE, type: "u64", label: "Allowed fuel" }],
};

function InventoryCanvasNode({ data }: NodeProps<InventoryFlowNode>) {
  if (data.kind === "item-type") {
    return (
      <PrimitiveConstant
        readOnly
        compact
        eyebrow="Fuel"
        label={data.label}
        name="ALLOWED_TYPE"
        dataType="u64"
        value={data.value ?? ""}
        valueLabel={`Type ID ${data.value ?? ""}`}
        iconSrc={data.iconSrc}
        selected={data.selected}
        connected={data.connected}
        handle={
          <Handle
            type="source"
            position={Position.Right}
            id={SOURCE_HANDLE}
            role="group"
            className={socketPortClassName({ direction: "out", type: "u64", connected: data.connected })}
            aria-label={`${data.label} u64 type output`}
          />
        }
      />
    );
  }

  return (
    <OperationNode
      compact
      spec={DEPOSIT_RULE_SPEC}
      connected={data.connected}
      selected={data.selected}
      handles={{
        [TARGET_HANDLE]: (
          <Handle
            type="target"
            position={Position.Left}
            id={TARGET_HANDLE}
            role="group"
            className={socketPortClassName({ direction: "in", type: "u64", connected: data.connected })}
            aria-label="Deposit rule allowed fuel input"
          />
        ),
      }}
    />
  );
}

type InventoryEdgeData = {
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onRemove: () => void;
};

type InventoryFlowEdge = Edge<InventoryEdgeData, "removable">;

function RemovableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  data,
}: EdgeProps<InventoryFlowEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const showButton = Boolean(data?.hovered || selected);

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} interactionWidth={32} />
      <EdgeLabelRenderer>
        <div
          className={cn(
            "nodrag nopan absolute z-10 transition-opacity duration-150 motion-reduce:transition-none",
            showButton ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onMouseEnter={data?.onEnter}
          onMouseLeave={data?.onLeave}
        >
          <button
            type="button"
            tabIndex={showButton ? 0 : -1}
            aria-label="Remove wire"
            title="Remove wire"
            onClick={(event) => {
              event.stopPropagation();
              data?.onRemove();
            }}
            className={cn(
              "grid size-9 cursor-pointer place-items-center border-2 border-background bg-danger text-background shadow-md transition-colors",
              "hover:border-danger hover:bg-foreground hover:text-background",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
              "forced-colors:border-[ButtonText] forced-colors:bg-[Canvas] forced-colors:text-[ButtonText]",
            )}
          >
            <Icon name="cross" className="size-4" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { inventory: InventoryCanvasNode };
const edgeTypes = { removable: RemovableEdge };

/* Browser-local store subscribed with useSyncExternalStore so SSR and client
   initial renders agree without triggering setState inside an effect. */
const listeners = new Map<string, Set<() => void>>();
const memoryStore = new Map<string, string | null>();

function emitStoreChange(key: string) {
  const keyListeners = listeners.get(key);
  if (!keyListeners) return;
  for (const listener of keyListeners) listener();
}

function subscribeStorage(key: string, callback: () => void) {
  let keyListeners = listeners.get(key);
  if (!keyListeners) {
    keyListeners = new Set();
    listeners.set(key, keyListeners);
  }
  keyListeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === key) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    keyListeners.delete(callback);
    if (keyListeners.size === 0) listeners.delete(key);
    window.removeEventListener("storage", onStorage);
  };
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

function writeStorage(key: string, value: string): boolean {
  memoryStore.set(key, value);
  try {
    window.localStorage.setItem(key, value);
    emitStoreChange(key);
    return true;
  } catch {
    emitStoreChange(key);
    return false;
  }
}

function removeStorage(key: string): boolean {
  memoryStore.delete(key);
  try {
    window.localStorage.removeItem(key);
    emitStoreChange(key);
    return true;
  } catch {
    emitStoreChange(key);
    return false;
  }
}

type CheckFeedback = {
  kind: "correct" | "incorrect" | "prerequisite";
  message: string;
};

export type InventoryWorkbenchProps = {
  exercise: InventoryExerciseDefinition;
  storageKey?: string;
};

export function InventoryWorkbench({
  exercise,
  storageKey = `frontier.lesson.${exercise.id}`,
}: InventoryWorkbenchProps) {
  const casesHeadingId = useId();
  const defaultSnapshot = useMemo(() => encodeProgress(exercise, initialState(exercise)), [exercise]);
  const subscribe = useCallback((cb: () => void) => subscribeStorage(storageKey, cb), [storageKey]);
  const rawStored = useSyncExternalStore(
    subscribe,
    () => readStorage(storageKey),
    () => defaultSnapshot,
  );

  const decoded = useMemo(() => decodeProgress(exercise, rawStored), [exercise, rawStored]);
  const state: InventoryLessonState = decoded.state;

  const [checkFeedback, setCheckFeedback] = useState<CheckFeedback | null>(null);
  const [storageNotice, setStorageNotice] = useState("");
  const [trace, setTrace] = useState<string>(RULE_NODE_ID);
  const [caseEval, setCaseEval] = useState<CaseEvaluation | null>(null);
  const [canvasMessage, setCanvasMessage] = useState<string>("");
  const [dragPositions, setDragPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const edgeLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ReactFlowInstance<InventoryFlowNode, InventoryFlowEdge> | null>(null);

  const enterEdge = useCallback((id: string) => {
    if (edgeLeaveTimer.current) {
      clearTimeout(edgeLeaveTimer.current);
      edgeLeaveTimer.current = null;
    }
    setHoveredEdgeId(id);
  }, []);

  const leaveEdge = useCallback((id: string) => {
    if (edgeLeaveTimer.current) clearTimeout(edgeLeaveTimer.current);
    edgeLeaveTimer.current = setTimeout(() => {
      setHoveredEdgeId((current) => (current === id ? null : current));
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      if (edgeLeaveTimer.current) clearTimeout(edgeLeaveTimer.current);
    };
  }, []);

  /* Recover viewport framing when the Workbench pane is hidden (0px) and
     reopened, or resized via the divider / mobile sheet. */
  useEffect(() => {
    const element = canvasRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    let frame = 0;
    let lastWidth = element.clientWidth;
    let lastHeight = element.clientHeight;
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      const width = Math.round(box.width);
      const height = Math.round(box.height);
      const changed = width !== lastWidth || height !== lastHeight;
      lastWidth = width;
      lastHeight = height;
      if (!changed || width < 32 || height < 32) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        flowRef.current?.fitView({ padding: 0.16, duration: 0 });
      });
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const dispatch = useCallback(
    (action: InventoryAction) => {
      const next = transition(exercise, state, action);
      if (action.type === "reset") {
        const cleared = removeStorage(storageKey);
        setStorageNotice(cleared ? "Progress reset in this browser." : "Storage unavailable; old progress could not be removed.");
        setCheckFeedback(null);
        setCaseEval(null);
        setCanvasMessage("");
        setDragPositions({});
        setTrace(RULE_NODE_ID);
        requestAnimationFrame(() => {
          flowRef.current?.fitView({ padding: 0.16, duration: 0 });
        });
        return;
      }

      if (action.type === "check") {
        const result = checkAnswer(exercise, state);
        setCheckFeedback({ kind: result.kind, message: result.message });
      } else if (action.type === "answer" || action.type === "connect" || action.type === "continue") {
        setCheckFeedback(null);
        if (action.type === "connect" || action.type === "continue") {
          setCaseEval(null);
          setCanvasMessage("");
        }
      } else if (action.type === "layout" || action.type === "move") {
        setCanvasMessage(next.message);
        if (action.type === "layout") {
          setDragPositions({});
          requestAnimationFrame(() => {
            flowRef.current?.fitView({ padding: 0.16, duration: 0 });
          });
        }
      }

      if (!writeStorage(storageKey, encodeProgress(exercise, next.state))) {
        setStorageNotice("Storage unavailable. Progress will not be saved.");
      } else {
        setStorageNotice("");
      }
    },
    [exercise, state, storageKey],
  );

  const graph = useMemo(() => graphFor(exercise, state), [exercise, state]);
  const generated = useMemo(() => generateInventoryRule(graph), [graph]);
  const task = exercise.steps[state.lesson - 1];
  const progress = progressFor(state);

  const activeFeedback: CheckFeedback | null =
    checkFeedback ??
    (state.checked ? { kind: "correct", message: checkAnswer(exercise, state).message } : null);
  const isWrongAnswer = activeFeedback?.kind === "incorrect";
  const isPrerequisiteFeedback = activeFeedback?.kind === "prerequisite";

  const fuelNodes = exercise.graph.nodes;

  const nodes: InventoryFlowNode[] = graph.nodes.map((node) => {
    const fuel = fuelNodes.find((f) => f.id === node.id);
    const connected = fuel ? state.selected === fuel.id : state.selected !== null;
    return {
      id: node.id,
      type: "inventory",
      position: dragPositions[node.id] ?? node.position,
      selected: node.id === trace,
      deletable: false,
      ariaLabel: fuel?.label ?? "Deposit rule",
      data: {
        kind: fuel ? "item-type" : "deposit-rule",
        label: fuel?.label ?? "Deposit rule",
        value: fuel?.typeId,
        iconSrc: fuel?.icon,
        connected,
        selected: node.id === trace,
      },
    };
  });

  const edges: InventoryFlowEdge[] = graph.edges.map((edge) => ({
    ...edge,
    type: "removable",
    selected: edge.id === selectedEdgeId,
    className: cn(wiringStyles.u64Edge, (trace === edge.source || trace === edge.target) && wiringStyles.tracedEdge),
    animated: trace === edge.source || trace === edge.target,
    deletable: true,
    reconnectable: false,
    ariaLabel: "Allowed item type connection",
    data: {
      hovered: hoveredEdgeId === edge.id,
      onEnter: () => enterEdge(edge.id),
      onLeave: () => leaveEdge(edge.id),
      onRemove: () => {
        setHoveredEdgeId(null);
        setSelectedEdgeId(null);
        dispatch({ type: "connect", selected: null });
      },
    },
  }));

  function handleConnect(connection: Connection) {
    if (
      (ITEM_NODE_IDS as readonly string[]).includes(connection.source) &&
      connection.sourceHandle === SOURCE_HANDLE &&
      connection.target === RULE_NODE_ID &&
      connection.targetHandle === TARGET_HANDLE
    ) {
      dispatch({ type: "connect", selected: connection.source as ItemNodeId });
    } else {
      setCanvasMessage("Connect a fuel output to the deposit rule input.");
    }
  }

  const traceNodeLabel = (id: string) => fuelNodes.find((f) => f.id === id)?.label ?? "Deposit rule";
  const traceCaption =
    trace === RULE_NODE_ID
      ? "ALLOWED_TYPE feeds deposit_requirement."
      : state.selected === trace
        ? `${traceNodeLabel(trace)} sets ALLOWED_TYPE to ${fuelNodes.find((f) => f.id === trace)?.typeId ?? ""}.`
        : "This fuel is not connected.";

  return (
    <div className="flex min-h-full flex-1 flex-col gap-s p-s text-foreground">
      {/* Header & progress */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Tag>{exercise.text.eyebrow}</Tag>
          <span className="font-heading text-step--2 font-bold text-muted uppercase">
            {state.complete ? "Complete" : `Step ${progress.current} of ${exercise.steps.length}`}
          </span>
        </div>
        <Button variant="secondary" size="xs" onClick={() => dispatch({ type: "reset" })}>
          Reset progress
        </Button>
      </div>

      <div className="grid gap-2xs">
        <progress
          max={exercise.steps.length}
          value={progress.completed}
          aria-label="Completed steps"
          aria-valuetext={`${progress.completed} of ${exercise.steps.length} steps complete`}
          className="h-1.5 w-full appearance-none overflow-hidden bg-line [&::-moz-progress-bar]:bg-accent [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:bg-accent"
        />
        <ol className="flex flex-wrap gap-x-s gap-y-1 text-step--2 text-muted">
          {exercise.steps.map((step, index) => {
            const done = progress.completed > index;
            const active = !state.complete && state.lesson === index + 1;
            return (
              <li
                key={step.id}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 font-heading",
                  active && "font-bold text-foreground",
                  done && "text-socket-u64",
                )}
              >
                <span aria-hidden="true">{done ? "✓" : index + 1}.</span>
                {step.title}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Current step instruction */}
      <div className="grid gap-1">
        <h2 ref={stepHeadingRef} tabIndex={-1} className="font-heading text-step-0 font-bold outline-none">
          {state.complete ? exercise.text.recapTitle : task.title}
        </h2>
        <p className="text-step--2 text-muted">{state.complete ? exercise.text.recap : task.instruction}</p>
      </div>

      {/* Interactive React Flow canvas */}
      <div className="flex flex-1 flex-col gap-xs">
        <div
          ref={canvasRef}
          className={cn("relative min-h-96 flex-1 min-w-0 border border-control-line bg-background", wiringStyles.canvas)}
          onFocusCapture={(event) => {
            const id = (event.target as Element).closest(".react-flow__node")?.getAttribute("data-id");
            if (id) setTrace(id);
          }}
        >
          <div className="absolute inset-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              aria-label="Inventory rule canvas"
              onInit={(instance) => {
                flowRef.current = instance;
              }}
              fitView
              fitViewOptions={{ padding: 0.16 }}
              minZoom={0.35}
              maxZoom={1.4}
              edgesReconnectable={false}
              deleteKeyCode={["Backspace", "Delete"]}
              onNodesChange={(changes) => {
                for (const change of changes) {
                  if (change.type !== "position") continue;
                  if (change.position && change.dragging) {
                    const pos = change.position;
                    setDragPositions((current) => ({ ...current, [change.id]: pos }));
                  } else if (change.dragging === false) {
                    const finalPos = change.position ?? dragPositions[change.id];
                    setDragPositions((current) => {
                      if (!(change.id in current)) return current;
                      const rest = { ...current };
                      delete rest[change.id];
                      return rest;
                    });
                    if (finalPos) {
                      dispatch({ type: "move", id: change.id, position: finalPos });
                    }
                  }
                }
              }}
              onEdgesChange={(changes) => {
                for (const change of changes) {
                  if (change.type === "select") {
                    setSelectedEdgeId((current) => (change.selected ? change.id : current === change.id ? null : current));
                  } else if (change.type === "remove") {
                    setHoveredEdgeId(null);
                    setSelectedEdgeId(null);
                    dispatch({ type: "connect", selected: null });
                  }
                }
              }}
              onEdgeMouseEnter={(_, edge) => enterEdge(edge.id)}
              onEdgeMouseLeave={(_, edge) => leaveEdge(edge.id)}
              onNodeClick={(_, node) => setTrace(node.id)}
              onNodeDragStart={(_, node) => setTrace(node.id)}
              onConnect={handleConnect}
              onConnectEnd={(_, connectionState) => {
                if (!connectionState.isValid) {
                  setCanvasMessage("Connect a fuel output to the deposit rule input.");
                }
              }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="var(--color-line)" />
              <Controls showInteractive={false} position="top-right" />
            </ReactFlow>
          </div>
        </div>

        {/* Keyboard-accessible wiring controls */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Wire fuel to deposit rule">
          {fuelNodes.map((fuel) => (
            <Button
              key={fuel.id}
              variant="secondary"
              size="xs"
              aria-pressed={state.selected === fuel.id}
              onClick={() => dispatch({ type: "connect", selected: fuel.id })}
            >
              Connect {fuel.label}
            </Button>
          ))}
          {state.selected !== null && (
            <Button variant="secondary" size="xs" onClick={() => dispatch({ type: "connect", selected: null })}>
              Disconnect
            </Button>
          )}
          <Button variant="secondary" size="xs" onClick={() => dispatch({ type: "layout" })}>
            Reset layout
          </Button>
        </div>
        {canvasMessage && (
          <p role="status" className="text-step--2 text-warning">
            {canvasMessage}
          </p>
        )}
      </div>

      {/* Question card */}
      <Plate
        as="section"
        corners="tr-bl"
        cut="sm"
        fill="var(--color-background)"
        keyline="var(--color-control-line)"
        className="grid gap-xs p-s"
        aria-label="Step question"
      >
        <fieldset className="grid gap-xs">
          <legend className="font-heading text-step-1 font-bold text-foreground">{task.question}</legend>
          {task.context && <p className="text-step--1 text-muted">{task.context}</p>}
          <div className="mt-1 grid gap-2.5">
            {task.choices.map((choice) => {
              const selected = state.answer === choice.id;
              const isCorrect = selected && state.checked;
              const isIncorrect = selected && isWrongAnswer;
              return (
                <label
                  key={choice.id}
                  className={cn(
                    "group flex min-h-12 cursor-pointer items-start gap-3.5 border px-s py-xs text-step-0 leading-snug transition-colors",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foreground",
                    isCorrect
                      ? "border-success bg-card-secondary font-medium text-foreground"
                      : isIncorrect
                        ? "border-danger bg-card-secondary font-medium text-foreground"
                        : selected
                          ? "border-accent-text bg-card-secondary font-medium text-foreground"
                          : "border-line bg-card text-foreground hover:border-control-line hover:bg-card-secondary/50",
                  )}
                >
                  <input
                    type="radio"
                    name={`answer-${exercise.id}`}
                    value={choice.id}
                    checked={selected}
                    onChange={() => dispatch({ type: "answer", answer: choice.id })}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1 grid size-5 flex-none place-items-center rounded-full border-2 transition-colors",
                      isCorrect
                        ? "border-success bg-background forced-colors:border-[Highlight]"
                        : isIncorrect
                          ? "border-danger bg-background forced-colors:border-[Highlight]"
                          : selected
                            ? "border-accent-text bg-background forced-colors:border-[Highlight]"
                            : "border-control-line bg-background group-hover:border-foreground forced-colors:border-[ButtonText]",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2.5 rounded-full transition-transform duration-150 motion-reduce:transition-none",
                        isCorrect
                          ? "scale-100 bg-success forced-colors:bg-[Highlight]"
                          : isIncorrect
                            ? "scale-100 bg-danger forced-colors:bg-[Highlight]"
                            : selected
                              ? "scale-100 bg-accent forced-colors:bg-[Highlight]"
                              : "scale-0 bg-transparent",
                      )}
                    />
                  </span>
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span>{choice.label}</span>
                    {isCorrect && activeFeedback && (
                      <span
                        role="status"
                        aria-live="polite"
                        className="text-step--1 font-normal text-success forced-colors:text-[CanvasText]"
                      >
                        {activeFeedback.message}
                      </span>
                    )}
                    {isIncorrect && activeFeedback && (
                      <span
                        role="status"
                        aria-live="polite"
                        className="text-step--1 font-normal text-danger forced-colors:text-[CanvasText]"
                      >
                        {activeFeedback.message}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {!state.checked && (
              <Button variant="primary" size="sm" disabled={state.answer === null} onClick={() => dispatch({ type: "check" })}>
                Check answer
              </Button>
            )}
            {state.checked && !state.complete && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  dispatch({ type: "continue" });
                  stepHeadingRef.current?.focus();
                }}
              >
                Continue
              </Button>
            )}
            {state.complete && (
              <Button variant="primary" size="sm" onClick={() => dispatch({ type: "reset" })}>
                Practice again
              </Button>
            )}
          </div>
          <Tag>Learning simulation</Tag>
        </div>

        {isPrerequisiteFeedback && activeFeedback && (
          <p
            role="status"
            aria-live="polite"
            className="border-l-2 border-warning pl-3 text-step--1 text-foreground"
          >
            {activeFeedback.message}
          </p>
        )}
      </Plate>

      {/* Boundary cases (Step 2) */}
      {task.cases.length > 0 && (
        <section className="grid gap-2xs border border-line bg-background p-s" aria-labelledby={casesHeadingId}>
          <h3 id={casesHeadingId} className="font-heading text-step--1 font-bold">
            {exercise.text.caseHeading}
          </h3>
          <div className="flex flex-wrap gap-2">
            {task.cases.map((caseId) => {
              const entry = exercise.cases.find((c) => c.id === caseId);
              if (!entry) return null;
              return (
                <Button
                  key={entry.id}
                  variant="secondary"
                  size="xs"
                  disabled={!generated.ok}
                  onClick={() => setCaseEval(evaluateCase(exercise, state, entry.id))}
                >
                  {entry.label}
                </Button>
              );
            })}
          </div>
          {caseEval ? (
            <div
              role="status"
              className={cn(
                "grid gap-1 border-l-2 pl-3 text-step--2",
                caseEval.ok && caseEval.rulePasses && caseEval.blockers.length === 0
                  ? "border-success text-foreground"
                  : "border-warning text-foreground",
              )}
            >
              {caseEval.ok && (
                <span className="font-heading font-bold uppercase">
                  {caseEval.rulePasses && caseEval.blockers.length === 0
                    ? "Passes all checks"
                    : !caseEval.rulePasses
                      ? "Rejected by type check"
                      : `Blocked by: ${caseEval.blockers.join(", ")}`}
                </span>
              )}
              <span className="text-muted">{caseEval.message}</span>
            </div>
          ) : (
            <p role="status" className="text-step--2 text-muted">
              {exercise.text.casePrompt}
            </p>
          )}
        </section>
      )}

      {/* Generated Move with Shiki syntax highlighting */}
      <div className="grid gap-2xs border-t border-line pt-s">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Highlight node code">
          {[...fuelNodes.map((f) => [f.id, f.label] as const), [RULE_NODE_ID, "Rule"] as const].map(([id, label]) => (
            <Button
              key={id}
              variant="secondary"
              size="xs"
              aria-pressed={trace === id}
              aria-label={`Highlight ${label} code`}
              onClick={() => setTrace(id)}
            >
              {label}
            </Button>
          ))}
        </div>
        <p className="text-step--2 text-muted">{traceCaption}</p>
        <SourcePreview
          generated={{
            lines: generated.lines,
            errors: generated.ok ? [] : generated.diagnostics.map((d) => d.message),
          }}
          selection={trace}
          heading="Generated Move · read only · uncompiled"
          description={
            <>
              Targets{" "}
              <a
                href={DEPOSIT_REQUIREMENT_URL}
                {...EXTERNAL}
                className="inline-flex items-center gap-1 underline decoration-control-line underline-offset-2 hover:text-accent-text"
              >
                world-contracts/dev (e1eff82e)
                <Icon name="external" className="size-2.5" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              ; not compiled or deployed.
            </>
          }
          emptyMessage="Connect a fuel to generate Move."
          emptyHint="This rule needs exactly one wire."
        />
      </div>

      {/* Browser-local storage notice (only shown on reset or error) */}
      {(storageNotice || decoded.message) && (
        <p role="status" className="text-step--3 text-muted">
          {storageNotice || decoded.message}
        </p>
      )}
    </div>
  );
}

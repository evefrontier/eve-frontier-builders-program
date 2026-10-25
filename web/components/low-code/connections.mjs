// @ts-check
export const socketTypes = /** @type {const} */ (["execution", "u64", "item", "boolean"]);
/** @typedef {(typeof socketTypes)[number]} SocketType */

export const socketTypeMeta = /** @type {const} */ ({
  execution: { badge: "exec", glyph: "▸", label: "Request flow" },
  u64: { badge: "u64", glyph: "●", label: "u64 integer" },
  item: { badge: "item", glyph: "◆", label: "Item / Entity" },
  boolean: { badge: "bool", glyph: "▲", label: "Boolean signal" },
});

export const constantNames = /** @type {const} */ (["CONSTANT_A", "CONSTANT_B"]);
export const consumerIds = /** @type {const} */ (["require", "transfer"]);
export const executionSourceIds = /** @type {const} */ (["start", "require", "transfer"]);
export const executionTargetIds = /** @type {const} */ (["require", "transfer", "complete"]);

/** @typedef {{source: string, target: string, sourceHandle: string | null, targetHandle: string | null}} FlowConnection */
/** @typedef {FlowConnection} ValueConnection */

/**
 * Resolves the socket type of a source or target handle.
 * @param {string} nodeId
 * @param {string | null | undefined} handleId
 * @param {"source" | "target"} end
 * @param {Record<string, SocketType>} [customTypes]
 * @returns {SocketType | null}
 */
export function getHandleSocketType(nodeId, handleId, end, customTypes) {
  if (end === "source") {
    if (constantNames.some(name => name === nodeId) && handleId === "value") {
      return customTypes?.[nodeId] ?? "u64";
    }
    if (executionSourceIds.some(id => id === nodeId) && handleId === "exec-out") return "execution";
    return null;
  }
  if (consumerIds.some(id => id === nodeId) && handleId === "quantity") return "u64";
  if (executionTargetIds.some(id => id === nodeId) && handleId === "exec-in") return "execution";
  if (consumerIds.some(id => id === nodeId) && handleId === "item") return "item";
  if (nodeId === "assert" && handleId === "condition") return "boolean";
  return null;
}

/**
 * Checks whether adding an execution edge would create a cycle.
 * @param {string} source
 * @param {string} target
 * @param {FlowConnection[]} edges
 * @returns {boolean}
 */
export function createsExecutionCycle(source, target, edges) {
  if (source === target) return true;
  const visited = new Set([source]);
  let current = target;
  while (current) {
    if (visited.has(current)) return true;
    visited.add(current);
    const next = edges.find(edge => edge.sourceHandle === "exec-out" && edge.source === current);
    if (!next) return false;
    current = next.target;
  }
  return false;
}

/** Value validity deliberately does not participate in typed wiring.
 * @param {FlowConnection} connection
 * @param {FlowConnection[]} edges
 * @param {Record<string, SocketType>} [customTypes]
 * @returns {string | null}
 */
export function connectionError(connection, edges, customTypes) {
  const sourceType = getHandleSocketType(connection.source, connection.sourceHandle, "source", customTypes);
  const targetType = getHandleSocketType(connection.target, connection.targetHandle, "target", customTypes);

  if (!sourceType) {
    return "Choose a valid output socket (Constant Value out · u64 or Operation Request out · exec).";
  }
  if (!targetType) {
    return "Choose a valid input socket (Quantity in · u64 or Request in · exec).";
  }
  if (sourceType !== targetType) {
    return `Type mismatch: cannot connect ${sourceType} output to ${targetType} input.`;
  }
  if (edges.some(edge =>
    edge.source === connection.source &&
    edge.target === connection.target &&
    edge.sourceHandle === connection.sourceHandle &&
    edge.targetHandle === connection.targetHandle
  )) {
    return `That ${sourceType} connection already exists.`;
  }

  if (sourceType === "u64") {
    if (edges.some(edge => edge.target === connection.target && edge.targetHandle === "quantity")) {
      return "Quantity input already has a u64 source. Disconnect it first.";
    }
    return null;
  }

  if (sourceType === "execution") {
    if (createsExecutionCycle(connection.source, connection.target, edges)) {
      return "Execution flow cannot connect a node to itself or form a cycle.";
    }
    if (edges.some(edge => edge.source === connection.source && edge.sourceHandle === "exec-out")) {
      return "Request out already connected. Linear Request cannot branch; disconnect it first.";
    }
    if (edges.some(edge => edge.target === connection.target && edge.targetHandle === "exec-in")) {
      return "Request in already has an incoming Request. Disconnect it first.";
    }
    return null;
  }

  return "Unsupported socket connection.";
}

/** @param {FlowConnection[]} edges @param {FlowConnection} connection @param {Record<string, SocketType>} [customTypes] */
export function connectValue(edges, connection, customTypes) {
  const error = connectionError(connection, edges, customTypes);
  return { edges: error ? edges : [...edges, connection], error };
}

/**
 * Disconnects an input socket on a target node.
 * @param {FlowConnection[]} edges
 * @param {string} target
 * @param {"quantity" | "exec-in"} [targetHandle="quantity"]
 */
export function disconnectValue(edges, target, targetHandle = "quantity") {
  return edges.filter(edge => !(edge.target === target && edge.targetHandle === targetHandle));
}

/** @param {string} source @param {string} target @returns {FlowConnection} */
export function valueConnection(source, target) {
  return { source, target, sourceHandle: "value", targetHandle: "quantity" };
}

/** @param {string} source @param {string} target @returns {FlowConnection} */
export function executionConnection(source, target) {
  return { source, target, sourceHandle: "exec-out", targetHandle: "exec-in" };
}

export function initialConnections() {
  return [
    executionConnection("start", "require"),
    executionConnection("require", "transfer"),
    executionConnection("transfer", "complete"),
    valueConnection("CONSTANT_A", "require"),
    valueConnection("CONSTANT_B", "transfer"),
  ];
}

/**
 * Traces the connected execution flow from `start` (`Start Request`) to `complete` (`Complete Request`).
 * @param {FlowConnection[]} edges
 * @returns {{ steps: string[], error: string | null }}
 */
export function traceExecutionFlow(edges) {
  const execEdges = edges.filter(edge => edge.sourceHandle === "exec-out" && edge.targetHandle === "exec-in");
  const steps = ["start"];
  const visited = new Set(steps);
  let current = "start";

  while (current !== "complete") {
    const nextEdge = execEdges.find(edge => edge.source === current);
    if (!nextEdge) {
      return {
        steps,
        error: "Execution flow incomplete: connect Start Request through to Complete Request to consume the linear Request.",
      };
    }
    if (visited.has(nextEdge.target)) {
      return {
        steps,
        error: "Execution flow contains a cycle.",
      };
    }
    visited.add(nextEdge.target);
    steps.push(nextEdge.target);
    current = nextEdge.target;
  }

  return { steps, error: null };
}

// @ts-check
export const constantNames = /** @type {const} */ (["CONSTANT_A", "CONSTANT_B"]);
export const consumerIds = /** @type {const} */ (["accept", "dispense"]);
/** @typedef {{source: string, target: string, sourceHandle: string | null, targetHandle: string | null}} ValueConnection */

/** Value validity deliberately does not participate in typed wiring.
 * @param {ValueConnection} connection
 * @param {ValueConnection[]} edges
 * @returns {string | null}
 */
export function connectionError(connection, edges) {
  if (!constantNames.some(name => name === connection.source) || connection.sourceHandle !== "value") {
    return "Choose a Primitive Constant's u64 Value out socket.";
  }
  if (!consumerIds.some(id => id === connection.target) || connection.targetHandle !== "quantity") {
    return "Connect Value out to an Accept or Dispense u64 Quantity in, not Execution flow.";
  }
  if (edges.some(edge => edge.source === connection.source && edge.target === connection.target)) {
    return "That Value connection already exists.";
  }
  if (edges.some(edge => edge.target === connection.target)) {
    return "Quantity input already has a source. Disconnect it first.";
  }
  return null;
}

/** @param {ValueConnection[]} edges @param {ValueConnection} connection */
export function connectValue(edges, connection) {
  const error = connectionError(connection, edges);
  return { edges: error ? edges : [...edges, connection], error };
}

/** @param {ValueConnection[]} edges @param {string} target */
export function disconnectValue(edges, target) {
  return edges.filter(edge => edge.target !== target);
}

/** @param {string} source @param {string} target @returns {ValueConnection} */
export function valueConnection(source, target) {
  return { source, target, sourceHandle: "value", targetHandle: "quantity" };
}

export function initialConnections() {
  return [valueConnection("CONSTANT_A", "accept"), valueConnection("CONSTANT_B", "dispense")];
}

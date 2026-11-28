// @ts-check
import { validateU64 } from "./u64.mjs";

const nodeKinds = new Map([
  ["item-a", "item-type"],
  ["item-b", "item-type"],
  ["deposit-rule", "deposit-rule"],
]);
const nodeFields = [
  "id",
  "type",
  "data",
  "position",
  "selected",
  "dragging",
  "measured",
  "width",
  "height",
  "zIndex",
];

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const isRecord = (value) =>
  value !== null &&
  typeof value === "object" &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

/** @param {Record<string, unknown>} record @param {string[]} keys */
const hasOnly = (record, keys) => Object.keys(record).every((key) => keys.includes(key));

/** @typedef {{ code: string; message: string; nodeId?: string }} GeneratorDiagnostic */
/** @typedef {{ text: string; owners: string[] }} GeneratedLine */
/** @typedef {{ ok: boolean; normalised: { allowedType: string } | null; source: string | null; lines: GeneratedLine[]; diagnostics: GeneratorDiagnostic[] }} InventoryGenerationResult */

/** @param {GeneratorDiagnostic[]} diagnostics @returns {InventoryGenerationResult} */
const failure = (diagnostics) => ({ ok: false, normalised: null, source: null, lines: [], diagnostics });

/** @param {string} code @param {string} message @param {string} [nodeId] @returns {GeneratorDiagnostic} */
const diagnostic = (code, message, nodeId) => (nodeId ? { code, message, nodeId } : { code, message });

/**
 * Accept plain graph data and generate deterministic Move text for the Inventory deposit rule.
 * Positions and insertion order do not affect the emitted Move source.
 * @param {unknown} graph
 * @returns {InventoryGenerationResult}
 */
export function generateInventoryRule(graph) {
  if (
    !isRecord(graph) ||
    !Object.hasOwn(graph, "nodes") ||
    !Object.hasOwn(graph, "edges") ||
    !Array.isArray(graph.nodes) ||
    !Array.isArray(graph.edges)
  ) {
    return failure([diagnostic("GRAPH_SHAPE", "Provide a graph with nodes and edges arrays.")]);
  }
  if (!hasOnly(graph, ["nodes", "edges", "viewport"])) {
    return failure([diagnostic("GRAPH_FIELDS", "Only nodes, edges and optional viewport metadata are supported.")]);
  }
  if (graph.nodes.length !== 3) {
    return failure([diagnostic("NODE_COUNT", "Use exactly two item-type constants and one deposit rule.")]);
  }
  if (graph.edges.length !== 1) {
    return failure([diagnostic("EDGE_COUNT", "Connect exactly one item-type constant to the deposit rule.")]);
  }
  const edge = graph.edges[0];
  if (!isRecord(edge)) {
    return failure([diagnostic("EDGE_SHAPE", "The selected connection must be a plain data record.")]);
  }
  if (!hasOnly(edge, ["id", "source", "sourceHandle", "target", "targetHandle", "selected", "type"])) {
    return failure([diagnostic("EDGE_FIELDS", "Only a typed connection and optional canvas metadata are supported.")]);
  }
  if (
    !Object.hasOwn(edge, "source") ||
    !Object.hasOwn(edge, "target") ||
    typeof edge.source !== "string" ||
    !["item-a", "item-b"].includes(edge.source) ||
    edge.target !== "deposit-rule"
  ) {
    return failure([
      diagnostic("EDGE_ENDPOINT", "Connect item-a or item-b to deposit-rule; execution edges and cycles are unsupported."),
    ]);
  }
  if (
    !Object.hasOwn(edge, "sourceHandle") ||
    !Object.hasOwn(edge, "targetHandle") ||
    edge.sourceHandle !== "value" ||
    edge.targetHandle !== "allowed-type"
  ) {
    return failure([diagnostic("EDGE_PORT", "Connect the item's value output to the rule's allowed-type input.")]);
  }

  /** @type {GeneratorDiagnostic[]} */
  const diagnostics = [];
  /** @type {Map<string, Record<string, unknown>>} */
  const nodes = new Map();
  /** @type {Map<string, string>} */
  const values = new Map();

  for (const node of graph.nodes) {
    if (!isRecord(node)) {
      diagnostics.push(diagnostic("NODE_SHAPE", "Each node must be a plain data record."));
      continue;
    }
    if (!Object.hasOwn(node, "id") || typeof node.id !== "string" || !nodeKinds.has(node.id)) {
      diagnostics.push(diagnostic("NODE_ID", "Use only item-a, item-b and deposit-rule nodes."));
      continue;
    }
    const id = node.id;
    if (nodes.has(id)) {
      diagnostics.push(diagnostic("NODE_DUPLICATE", "Each prepared node must appear exactly once.", id));
      continue;
    }
    nodes.set(id, node);
    if (!hasOnly(node, nodeFields)) {
      diagnostics.push(diagnostic("NODE_FIELDS", "Use only lesson data and supported canvas metadata.", id));
    }
    if (!Object.hasOwn(node, "type") || node.type !== nodeKinds.get(id)) {
      diagnostics.push(diagnostic("NODE_TYPE", "Keep the prepared item-type and deposit-rule node kinds.", id));
    }
    const isConstant = id !== "deposit-rule";
    if (!Object.hasOwn(node, "data") || !isRecord(node.data) || !hasOnly(node.data, isConstant ? ["value"] : [])) {
      diagnostics.push(
        diagnostic("NODE_DATA", "Only item constants have an editable value; the rule scaffold is fixed.", id),
      );
      continue;
    }
    if (!isConstant) continue;
    if (!Object.hasOwn(node.data, "value") || typeof node.data.value !== "string") {
      diagnostics.push(diagnostic("VALUE_TYPE", "Store the item type as decimal text, not a JavaScript number.", id));
      continue;
    }
    if (node.data.value.length > 64) {
      diagnostics.push(diagnostic("VALUE_LIMIT", "Keep item-type input to at most 64 characters.", id));
      continue;
    }
    const parsed = validateU64(node.data.value);
    if (parsed.error || parsed.literal === null) {
      diagnostics.push(diagnostic("U64", parsed.error ?? "Invalid u64.", id));
    } else if (parsed.literal === "0") {
      diagnostics.push(diagnostic("VALUE_ZERO", "Item type ID must be a non-zero u64 (variant::new_key rejects 0).", id));
    } else {
      values.set(id, parsed.literal);
    }
  }
  if (diagnostics.length) return failure(diagnostics);

  const selectedId = edge.source;
  const allowedType = values.get(selectedId);
  if (!allowedType) return failure([diagnostic("U64", "Selected constant has no valid u64 value.", selectedId)]);

  /** @type {GeneratedLine[]} */
  const lines = [];
  /** @param {string} text @param {string[]} [owners] */
  const line = (text, owners = []) => lines.push({ text, owners });
  const rule = ["deposit-rule"];
  const value = [selectedId];
  line("// Generated Inventory lesson configuration (uncompiled; targets world-contracts/dev e1eff82e).");
  line("// Owner checks are fixed scaffold.");
  line("module inventory_rule_proof::deposit_rule;");
  line("");
  line("use core::{access_cap::AccessCap, action, entity::Entity};");
  line("use inventory::inventory;");
  line("use std::string::String;");
  line("");
  line(`const ALLOWED_TYPE: u64 = ${allowedType};`, value);
  line("");
  line("public fun enable(");
  line("    entity: &mut Entity,");
  line("    owner_cap: &AccessCap,");
  line("    action_name: String,");
  line("    component_id: u64,");
  line("    ctx: &mut TxContext,");
  line(") {");
  line("    let rule = inventory::deposit_requirement(", rule);
  line("        component_id,", rule);
  line("        option::some(ALLOWED_TYPE),", [selectedId, ...rule]);
  line("        option::none(),", rule);
  line("        option::none(),", rule);
  line("        option::none(),", rule);
  line("    );", rule);
  line("    let mut req = entity.enable_action(action_name, action::new(vector[rule]), ctx);", rule);
  line("    entity.verify_owner(&mut req, owner_cap);");
  line("    entity.complete_request(req);");
  line("}");
  return {
    ok: true,
    normalised: { allowedType },
    source: lines.map((entry) => entry.text).join("\n") + "\n",
    lines,
    diagnostics: [],
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import { generateInventoryRule } from "./inventory-generator.mjs";
import { correspondingLines } from "./source.mjs";

function makeGraph(
  selected = "item-a",
  positions = { "item-a": { x: 0, y: 0 }, "item-b": { x: 0, y: 180 }, "deposit-rule": { x: 360, y: 90 } },
) {
  return {
    nodes: [
      { id: "item-a", type: "item-type", data: { value: "88335" }, position: positions["item-a"] },
      { id: "item-b", type: "item-type", data: { value: "88319" }, position: positions["item-b"] },
      { id: "deposit-rule", type: "deposit-rule", data: {}, position: positions["deposit-rule"] },
    ],
    edges: selected
      ? [{ id: "selected-type", source: selected, sourceHandle: "value", target: "deposit-rule", targetHandle: "allowed-type" }]
      : [],
  };
}

test("generates deterministic 5-argument deposit_requirement Move for D1 Fuel (88335) and D2 Fuel (88319)", () => {
  const d1 = generateInventoryRule(makeGraph("item-a"));
  assert.equal(d1.ok, true);
  assert.equal(d1.normalised?.allowedType, "88335");
  assert.match(d1.source ?? "", /const ALLOWED_TYPE: u64 = 88335;/);
  assert.match(
    d1.source ?? "",
    /inventory::deposit_requirement\(\n\s+component_id,\n\s+option::some\(ALLOWED_TYPE\),\n\s+option::none\(\),\n\s+option::none\(\),\n\s+option::none\(\),\n\s+\);/,
  );

  const d2 = generateInventoryRule(makeGraph("item-b"));
  assert.equal(d2.ok, true);
  assert.equal(d2.normalised?.allowedType, "88319");
  assert.match(d2.source ?? "", /const ALLOWED_TYPE: u64 = 88319;/);
});

test("maps line ownership to connected fuel constant and deposit-rule", () => {
  const d1 = generateInventoryRule(makeGraph("item-a"));
  assert.equal(d1.ok, true);
  const itemALines = correspondingLines(d1.lines, "item-a");
  const itemBLines = correspondingLines(d1.lines, "item-b");
  const ruleLines = correspondingLines(d1.lines, "deposit-rule");
  assert.equal(itemALines.length, 2);
  assert.deepEqual(itemBLines, []);
  assert.equal(ruleLines.length, 8);
  assert.ok(ruleLines.includes(itemALines[1]));
});

test("output is byte-identical regardless of node positions or insertion order", () => {
  const a = generateInventoryRule(makeGraph("item-a"));
  const moved = makeGraph("item-a", {
    "item-a": { x: 999, y: -420 },
    "item-b": { x: -120, y: 800 },
    "deposit-rule": { x: 5, y: 5 },
  });
  moved.nodes.reverse();
  const b = generateInventoryRule(moved);
  assert.equal(b.ok, true);
  assert.equal(a.source, b.source);
});

test("rejects disconnected, zero, numeric, overflow, duplicate, and invalid-handle graphs", () => {
  const empty = generateInventoryRule(makeGraph(null));
  assert.equal(empty.ok, false);
  assert.equal(empty.source, null);
  assert.equal(empty.diagnostics[0]?.code, "EDGE_COUNT");

  const zero = makeGraph("item-a");
  zero.nodes[0].data.value = "0";
  const zeroRes = generateInventoryRule(zero);
  assert.equal(zeroRes.ok, false);
  assert.equal(zeroRes.diagnostics[0]?.code, "VALUE_ZERO");

  const numeric = makeGraph("item-a");
  // @ts-expect-error deliberate runtime check for non-string typeId
  numeric.nodes[0].data.value = 88335;
  const numericRes = generateInventoryRule(numeric);
  assert.equal(numericRes.ok, false);
  assert.equal(numericRes.diagnostics[0]?.code, "VALUE_TYPE");

  const overflow = makeGraph("item-a");
  overflow.nodes[0].data.value = "18446744073709551616";
  const overflowRes = generateInventoryRule(overflow);
  assert.equal(overflowRes.ok, false);
  assert.equal(overflowRes.diagnostics[0]?.code, "U64");

  const badHandle = makeGraph("item-a");
  badHandle.edges[0].targetHandle = "wrong";
  const badHandleRes = generateInventoryRule(badHandle);
  assert.equal(badHandleRes.ok, false);
  assert.equal(badHandleRes.diagnostics[0]?.code, "EDGE_PORT");

  const dupNode = makeGraph("item-a");
  dupNode.nodes[1].id = "item-a";
  const dupRes = generateInventoryRule(dupNode);
  assert.equal(dupRes.ok, false);
  assert.equal(dupRes.diagnostics[0]?.code, "NODE_DUPLICATE");
});

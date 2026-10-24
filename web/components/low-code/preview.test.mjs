import { test } from "node:test";
import assert from "node:assert/strict";
import { validateU64 } from "./u64.mjs";
import {
  constantNames, initialConnections, valueConnection, connectValue,
  connectionError, disconnectValue,
} from "./connections.mjs";
import { formatSource, correspondingLines } from "./source.mjs";

const values = { CONSTANT_A: "10", CONSTANT_B: "40" };

test("u64 boundaries and exact precision", () => {
  for (const text of ["0", "1", "9007199254740993", "18446744073709551615"]) {
    assert.deepEqual(validateU64(text), { literal: text, error: null });
  }
  assert.ok(validateU64("18446744073709551616").error);
  assert.ok(validateU64("9".repeat(1000)).error);
});

test("normalise surrounding whitespace and leading zeros, never mutate text", () => {
  const text = " 00042 ";
  assert.equal(validateU64(text).literal, "42");
  assert.equal(text, " 00042 ");
  assert.equal(validateU64("000").literal, "0");
  assert.equal(validateU64("0".repeat(1000) + "42").literal, "42");
  for (const text of ["", "   ", "-1", "+42", "1.2", "1e3", "0xff", "1_000", "４２", "1 2", "abc"]) {
    assert.ok(validateU64(text).error, JSON.stringify(text));
  }
});

test("start with independent fixed-name constants", () => {
  assert.deepEqual(initialConnections().map(edge => edge.source), constantNames);
});

test("fan-out retains one shared source and rejects duplicate/occupied inputs", () => {
  const first = connectValue([], valueConnection("CONSTANT_A", "accept"));
  const shared = connectValue(first.edges, valueConnection("CONSTANT_A", "dispense"));
  assert.equal(shared.error, null);
  assert.equal(shared.edges.length, 2);
  assert.ok(connectionError(valueConnection("CONSTANT_A", "accept"), shared.edges)?.includes("already exists"));
  const occupied = connectValue(shared.edges, valueConnection("CONSTANT_B", "accept"));
  assert.match(occupied.error, /Disconnect/);
  assert.equal(occupied.edges, shared.edges);
});

test("reject directions, execution/value mixing and unsupported sockets", () => {
  const edges = initialConnections();
  for (const connection of [
    valueConnection("accept", "CONSTANT_A"),
    valueConnection("CONSTANT_A", "CONSTANT_B"),
    valueConnection("UNKNOWN", "accept"),
    valueConnection("CONSTANT_A", "exchange"),
    { ...valueConnection("CONSTANT_A", "accept"), sourceHandle: "exec-out" },
    { ...valueConnection("CONSTANT_A", "accept"), targetHandle: "exec-in" },
    { ...valueConnection("CONSTANT_A", "accept"), sourceHandle: "bool" },
    { ...valueConnection("CONSTANT_A", "accept"), targetHandle: null },
  ]) {
    assert.ok(connectionError(connection, []));
    assert.equal(connectValue(edges, connection).edges, edges);
  }
});

test("disconnect removes only chosen input and never substitutes a default", () => {
  const initial = initialConnections();
  const remaining = disconnectValue(initial, "accept");
  assert.equal(remaining.length, 1);
  assert.equal(initial.length, 2);
  assert.deepEqual(formatSource(values, remaining).lines, []);
  assert.match(formatSource(values, remaining).errors.join(" "), /accept quantity/);
});

test("invalid text preserves wiring and cannot prevent otherwise valid new wiring", () => {
  const invalid = { ...values, CONSTANT_A: "-1" };
  const existing = [valueConnection("CONSTANT_A", "accept")];
  const result = connectValue(existing, valueConnection("CONSTANT_A", "dispense"));
  assert.equal(result.error, null);
  assert.equal(result.edges.length, 2);
  assert.deepEqual(existing, [valueConnection("CONSTANT_A", "accept")]);
  assert.equal(formatSource(invalid, result.edges).lines.length, 0);
  assert.match(formatSource(invalid, result.edges).errors.join(" "), /CONSTANT_A/);
});

test("one declaration and multiple uses, both displayed constants declared", () => {
  const shared = [valueConnection("CONSTANT_A", "accept"), valueConnection("CONSTANT_A", "dispense")];
  const source = formatSource(values, shared);
  const text = source.lines.map(line => line.text).join("\n");
  assert.equal(source.errors.length, 0);
  assert.equal((text.match(/const CONSTANT_A:/g) ?? []).length, 1);
  assert.match(text, /const CONSTANT_B: u64 = 40;/);
  assert.match(text, /accept_quantity = CONSTANT_A;/);
  assert.match(text, /dispense_quantity = CONSTANT_A;/);
  assert.deepEqual(correspondingLines(source.lines, "CONSTANT_A"), [2, 6, 7]);
  assert.deepEqual(correspondingLines(source.lines, "CONSTANT_B"), [3]);
  assert.deepEqual(correspondingLines(source.lines, "accept"), [6]);
  assert.deepEqual(correspondingLines(source.lines, "dispense"), [7]);
  assert.deepEqual(correspondingLines(source.lines, "exchange"), []);
  assert.deepEqual(correspondingLines(source.lines, "complete"), []);
});

test("unused invalid constant blocks source, valid edits update declaration only", () => {
  const shared = [valueConnection("CONSTANT_A", "accept"), valueConnection("CONSTANT_A", "dispense")];
  const blocked = formatSource({ ...values, CONSTANT_B: "not a number" }, shared);
  assert.deepEqual(blocked.lines, []);
  assert.match(blocked.errors.join(" "), /CONSTANT_B/);
  const before = formatSource(values, shared).lines;
  const after = formatSource({ ...values, CONSTANT_A: " 00042 " }, shared).lines;
  assert.equal(after[1].text, "    const CONSTANT_A: u64 = 42;");
  assert.deepEqual(before.filter((_, i) => i !== 1), after.filter((_, i) => i !== 1));
});

test("layout metadata cannot change source", () => {
  const before = initialConnections();
  const moved = before.map(edge => ({ ...edge, position: { x: 999, y: -50 } }));
  assert.deepEqual(formatSource(values, before), formatSource(values, moved));
});

test("invalid and incomplete preview reports every blocker and no stale snippet", () => {
  const source = formatSource({ CONSTANT_A: "", CONSTANT_B: "-1" }, []);
  assert.equal(source.errors.length, 4);
  assert.deepEqual(source.lines, []);
});

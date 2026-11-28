import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { parse } from "yaml";
import {
  PROGRESS_SCHEMA_VERSION,
  checkAnswer,
  decodeProgress,
  encodeProgress,
  evaluateCase,
  initialState,
  transition,
  validateInventoryExercise,
  validateState,
} from "./inventory-exercise.ts";

const yamlPath = join(
  process.cwd(),
  "..",
  "curriculum",
  "lessons",
  "pillar-1",
  "low-code-smart-assemblies",
  "inventory-deposit-rule.yaml",
);
const exercise = validateInventoryExercise(parse(readFileSync(yamlPath, "utf8")), "inventory-deposit-rule.yaml");

test("validateInventoryExercise accepts the checked-in lesson YAML and rejects malformed definitions", () => {
  assert.equal(exercise.id, "inventory-deposit-rule");
  assert.equal(exercise.steps.length, 3);

  const badTypeId = structuredClone(exercise);
  badTypeId.graph.nodes[0].typeId = 88335;
  assert.throws(() => validateInventoryExercise(badTypeId), /decimal string/);

  const badIcon = structuredClone(exercise);
  badIcon.graph.nodes[0].icon = "https://evil.example/icon.png";
  assert.throws(() => validateInventoryExercise(badIcon), /relative \/items/);

  const badCaseRef = structuredClone(exercise);
  badCaseRef.steps[0].cases = ["nonexistent"];
  assert.throws(() => validateInventoryExercise(badCaseRef), /defined case IDs/);
});

test("state transitions walk all 3 steps and keep layout resets separate from checked state", () => {
  let state = initialState(exercise);
  assert.equal(state.lesson, 1);

  // Wrong selection before checking
  state = transition(exercise, state, { type: "answer", answer: "rejects" }).state;
  const prereq = checkAnswer(exercise, state);
  assert.equal(prereq.kind, "prerequisite");
  assert.equal(prereq.correct, false);

  // Wire D1 Fuel and check wrong answer
  state = transition(exercise, state, { type: "connect", selected: "item-a" }).state;
  state = transition(exercise, state, { type: "answer", answer: "passes" }).state;
  const wrong = checkAnswer(exercise, state);
  assert.equal(wrong.kind, "incorrect");
  assert.equal(wrong.correct, false);

  // Layout reset preserves answer and unchecked state without mutating rule
  const moved = transition(exercise, state, { type: "move", id: "item-a", position: { x: 100, y: 50 } }).state;
  const resetLayout = transition(exercise, moved, { type: "layout" });
  assert.equal(resetLayout.state.selected, "item-a");
  assert.equal(resetLayout.state.answer, "passes");
  assert.equal(resetLayout.state.checked, false);
  assert.deepEqual(resetLayout.state.positions["item-a"], exercise.graph.positions["item-a"]);

  // Answer correctly and advance through Step 2 and Step 3
  state = transition(exercise, resetLayout.state, { type: "answer", answer: "rejects" }).state;
  state = transition(exercise, state, { type: "check" }).state;
  assert.equal(state.checked, true);

  state = transition(exercise, state, { type: "continue" }).state;
  assert.equal(state.lesson, 2);
  state = transition(exercise, state, { type: "connect", selected: "item-b" }).state;
  state = transition(exercise, state, { type: "answer", answer: "passes" }).state;
  state = transition(exercise, state, { type: "check" }).state;
  assert.equal(state.checked, true);

  state = transition(exercise, state, { type: "continue" }).state;
  assert.equal(state.lesson, 3);
  state = transition(exercise, state, { type: "connect", selected: null }).state;
  state = transition(exercise, state, { type: "answer", answer: "no-rule" }).state;
  state = transition(exercise, state, { type: "check" }).state;
  assert.equal(state.complete, true);
});

test("encodeProgress / decodeProgress round-trip and reset on version mismatch or corruption", () => {
  const state = transition(exercise, initialState(exercise), { type: "connect", selected: "item-a" }).state;
  assert.equal(validateState(exercise, state), true);

  const encoded = encodeProgress(exercise, state);
  const restored = decodeProgress(exercise, encoded);
  assert.equal(restored.restored, true);
  assert.equal(restored.message, "");
  assert.deepEqual(restored.state, state);

  const oldVersion = JSON.stringify({ schemaVersion: PROGRESS_SCHEMA_VERSION - 1, lessonVersion: exercise.progressVersion, state });
  const resetOld = decodeProgress(exercise, oldVersion);
  assert.equal(resetOld.restored, false);
  assert.match(resetOld.message, /changed/i);

  const corrupt = decodeProgress(exercise, "{not json");
  assert.equal(corrupt.restored, false);
  assert.match(corrupt.message, /could not be read/i);
});

test("evaluateCase reports matching type and blockers accurately", () => {
  const wiredD2 = transition(exercise, initialState(exercise), { type: "connect", selected: "item-b" }).state;
  const exact = evaluateCase(exercise, wiredD2, "exact");
  assert.equal(exact.ok, true);
  if (exact.ok) {
    assert.equal(exact.rulePasses, true);
    assert.deepEqual(exact.blockers, []);
  }

  const docking = evaluateCase(exercise, wiredD2, "docking");
  assert.equal(docking.ok, true);
  if (docking.ok) {
    assert.equal(docking.rulePasses, true);
    assert.deepEqual(docking.blockers, ["docking"]);
  }
});

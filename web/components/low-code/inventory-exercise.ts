import { generateInventoryRule } from "./inventory-generator.mjs";
import { validateU64 } from "./u64.mjs";

export const ITEM_NODE_IDS = ["item-a", "item-b"] as const;
export type ItemNodeId = (typeof ITEM_NODE_IDS)[number];
export const RULE_NODE_ID = "deposit-rule" as const;
export const SOURCE_HANDLE = "value" as const;
export const TARGET_HANDLE = "allowed-type" as const;

export type InventoryNodeConfig = {
  id: ItemNodeId;
  kind: "item-type";
  label: string;
  typeId: string;
  icon: string;
};

export type InventoryStepChoice = {
  id: string;
  label: string;
};

export type InventoryStep = {
  id: string;
  title: string;
  instruction: string;
  question: string;
  context?: string;
  choices: InventoryStepChoice[];
  rubric: {
    selection: ItemNodeId | null;
    answer: string;
    wrongSelection: string;
    incorrect: string;
    correct: string;
  };
  cases: string[];
};

export type InventoryCase = {
  id: string;
  label: string;
  itemType: string;
  blockers: string[];
  detail: string;
};

export type InventoryExerciseDefinition = {
  schemaVersion: number;
  id: string;
  progressVersion: number;
  exercise: "inventory-type-rule";
  graph: {
    nodes: InventoryNodeConfig[];
    rule: { id: typeof RULE_NODE_ID; kind: "deposit-rule" };
    positions: Record<string, { x: number; y: number }>;
    initialSelection: ItemNodeId | null;
  };
  text: {
    eyebrow: string;
    recapTitle: string;
    recap: string;
    noAnswer: string;
    caseHeading: string;
    casePrompt: string;
  };
  steps: InventoryStep[];
  cases: InventoryCase[];
};

export type InventoryLessonState = {
  lesson: number;
  selected: ItemNodeId | null;
  answer: string | null;
  checked: boolean;
  complete: boolean;
  positions: Record<string, { x: number; y: number }>;
};

export type InventoryAction =
  | { type: "answer"; answer: string }
  | { type: "connect"; selected: ItemNodeId | null }
  | { type: "check" }
  | { type: "continue" }
  | { type: "move"; id: string; position: { x: number; y: number } }
  | { type: "layout" }
  | { type: "reset" };

export type CaseEvaluation =
  | { ok: false; message: string }
  | { ok: true; rulePasses: boolean; blockers: string[]; message: string };

export const PROGRESS_SCHEMA_VERSION = 2;

const isRecord = (x: unknown): x is Record<string, unknown> => x !== null && typeof x === "object" && !Array.isArray(x);

const hasExactKeys = (x: unknown, keys: string[]): x is Record<string, unknown> =>
  isRecord(x) && Object.keys(x).length === keys.length && keys.every((k) => Object.hasOwn(x, k));

const isNonEmptyString = (x: unknown): x is string => typeof x === "string" && x.trim().length > 0;

const isSafeIconPath = (x: unknown): x is string =>
  typeof x === "string" && x.startsWith("/items/") && !x.includes("..") && !x.startsWith("//");

export function validPosition(p: unknown): p is { x: number; y: number } {
  return (
    hasExactKeys(p, ["x", "y"]) &&
    typeof p.x === "number" &&
    typeof p.y === "number" &&
    Number.isFinite(p.x) &&
    Number.isFinite(p.y) &&
    p.x >= -2000 &&
    p.x <= 2000 &&
    p.y >= -2000 &&
    p.y <= 2000
  );
}

/**
 * Validates an Inventory exercise YAML object at build time so malformed definitions
 * fail the build with an actionable message rather than crashing at render time.
 */
export function validateInventoryExercise(value: unknown, from = "exercise"): InventoryExerciseDefinition {
  function fail(reason: string): never {
    throw new Error(`${from}: invalid inventory-type-rule exercise — ${reason}`);
  }
  if (!isRecord(value)) fail("expected a YAML object");
  if (value.exercise !== "inventory-type-rule") fail(`expected exercise "inventory-type-rule"`);
  if (value.schemaVersion !== 1) fail("schemaVersion must be 1");
  if (!isNonEmptyString(value.id)) fail("id must be a non-empty string");
  if (typeof value.progressVersion !== "number" || !Number.isInteger(value.progressVersion) || value.progressVersion < 1) {
    fail("progressVersion must be a positive integer");
  }

  if (!isRecord(value.graph)) fail("graph must be an object");
  if (!Array.isArray(value.graph.nodes) || value.graph.nodes.length !== ITEM_NODE_IDS.length) {
    fail(`graph.nodes must contain exactly ${ITEM_NODE_IDS.length} item-type nodes`);
  }
  const seenNodeIds = new Set<string>();
  for (const node of value.graph.nodes) {
    if (!isRecord(node)) fail("each graph.nodes entry must be an object");
    if (typeof node.id !== "string" || !(ITEM_NODE_IDS as readonly string[]).includes(node.id)) {
      fail(`graph.nodes id must be one of ${ITEM_NODE_IDS.join(", ")}`);
    }
    if (seenNodeIds.has(node.id)) fail(`duplicate node id "${node.id}"`);
    seenNodeIds.add(node.id);
    if (node.kind !== "item-type") fail(`node "${node.id}" kind must be "item-type"`);
    if (!isNonEmptyString(node.label)) fail(`node "${node.id}" label must be a non-empty string`);
    if (typeof node.typeId !== "string") fail(`node "${node.id}" typeId must be a decimal string, not a number`);
    const u64 = validateU64(node.typeId);
    if (u64.error || u64.literal === null || u64.literal === "0") {
      fail(`node "${node.id}" typeId must be a non-zero u64 decimal string`);
    }
    if (!isSafeIconPath(node.icon)) fail(`node "${node.id}" icon must be a relative /items/... path`);
  }

  if (!isRecord(value.graph.rule) || value.graph.rule.id !== RULE_NODE_ID || value.graph.rule.kind !== "deposit-rule") {
    fail(`graph.rule must have id "${RULE_NODE_ID}" and kind "deposit-rule"`);
  }
  const expectedIds = [...ITEM_NODE_IDS, RULE_NODE_ID];
  if (!isRecord(value.graph.positions) || !hasExactKeys(value.graph.positions, expectedIds)) {
    fail(`graph.positions must define positions for ${expectedIds.join(", ")}`);
  }
  for (const id of expectedIds) {
    if (!validPosition(value.graph.positions[id])) fail(`graph.positions.${id} must have finite x/y within [-2000, 2000]`);
  }
  const validSelections: (string | null)[] = [null, ...ITEM_NODE_IDS];
  if (!validSelections.includes(value.graph.initialSelection as string | null)) {
    fail("graph.initialSelection must be null, item-a, or item-b");
  }

  if (!isRecord(value.text)) fail("text must be an object");
  for (const key of ["eyebrow", "recapTitle", "recap", "noAnswer", "caseHeading", "casePrompt"] as const) {
    if (!isNonEmptyString(value.text[key])) fail(`text.${key} must be a non-empty string`);
  }

  if (!Array.isArray(value.cases)) fail("cases must be an array");
  const caseIds = new Set<string>();
  for (const entry of value.cases) {
    if (!isRecord(entry) || !isNonEmptyString(entry.id) || !isNonEmptyString(entry.label) || !isNonEmptyString(entry.detail)) {
      fail("each case must have non-empty id, label, and detail strings");
    }
    if (typeof entry.itemType !== "string" || validateU64(entry.itemType).error) {
      fail(`case "${entry.id}" itemType must be a u64 decimal string`);
    }
    if (!Array.isArray(entry.blockers) || !entry.blockers.every(isNonEmptyString)) {
      fail(`case "${entry.id}" blockers must be an array of strings`);
    }
    if (caseIds.has(entry.id)) fail(`duplicate case id "${entry.id}"`);
    caseIds.add(entry.id);
  }

  if (!Array.isArray(value.steps) || value.steps.length === 0) fail("steps must be a non-empty array");
  for (const step of value.steps) {
    if (!isRecord(step)) fail("each step must be an object");
    for (const key of ["id", "title", "instruction", "question"] as const) {
      if (!isNonEmptyString(step[key])) fail(`step.${key} must be a non-empty string`);
    }
    if (step.context !== undefined && !isNonEmptyString(step.context)) fail(`step "${String(step.id)}" context must be a non-empty string`);
    if (!Array.isArray(step.choices) || step.choices.length < 2) {
      fail(`step "${String(step.id)}" must have at least 2 choices`);
    }
    const choiceIds = new Set<string>();
    for (const choice of step.choices) {
      if (!isRecord(choice) || !isNonEmptyString(choice.id) || !isNonEmptyString(choice.label)) {
        fail(`step "${String(step.id)}" choices must have non-empty id and label`);
      }
      if (choiceIds.has(choice.id)) fail(`step "${String(step.id)}" has duplicate choice "${choice.id}"`);
      choiceIds.add(choice.id);
    }
    if (!isRecord(step.rubric)) fail(`step "${String(step.id)}" rubric must be an object`);
    if (!validSelections.includes(step.rubric.selection as string | null)) {
      fail(`step "${String(step.id)}" rubric.selection must be null, item-a, or item-b`);
    }
    if (typeof step.rubric.answer !== "string" || !choiceIds.has(step.rubric.answer)) {
      fail(`step "${String(step.id)}" rubric.answer must match one of its choices`);
    }
    for (const key of ["wrongSelection", "incorrect", "correct"] as const) {
      if (!isNonEmptyString(step.rubric[key])) fail(`step "${String(step.id)}" rubric.${key} must be a non-empty string`);
    }
    if (!Array.isArray(step.cases) || !step.cases.every((id: unknown) => typeof id === "string" && caseIds.has(id))) {
      fail(`step "${String(step.id)}" cases must reference defined case IDs`);
    }
  }

  return value as InventoryExerciseDefinition;
}

export function isInventoryExercise(value: unknown): value is InventoryExerciseDefinition {
  if (!isRecord(value) || value.exercise !== "inventory-type-rule") return false;
  try {
    validateInventoryExercise(value);
    return true;
  } catch {
    return false;
  }
}

export function nodeIdsFor(def: InventoryExerciseDefinition): string[] {
  return [...def.graph.nodes.map((n) => n.id), def.graph.rule.id];
}

export function initialState(def: InventoryExerciseDefinition): InventoryLessonState {
  const ids = nodeIdsFor(def);
  return {
    lesson: 1,
    selected: def.graph.initialSelection,
    answer: null,
    checked: false,
    complete: false,
    positions: Object.fromEntries(ids.map((id) => [id, { ...def.graph.positions[id] }])),
  };
}

export function graphFor(def: InventoryExerciseDefinition, state: InventoryLessonState) {
  return {
    nodes: [
      ...def.graph.nodes.map((node) => ({
        id: node.id,
        type: node.kind,
        data: { value: node.typeId },
        position: state.positions[node.id] ?? def.graph.positions[node.id],
      })),
      {
        id: def.graph.rule.id,
        type: def.graph.rule.kind,
        data: {},
        position: state.positions[def.graph.rule.id] ?? def.graph.positions[def.graph.rule.id],
      },
    ],
    edges: state.selected
      ? [
          {
            id: "selected-type",
            source: state.selected,
            sourceHandle: SOURCE_HANDLE,
            target: def.graph.rule.id,
            targetHandle: TARGET_HANDLE,
          },
        ]
      : [],
  };
}

export function validateState(def: InventoryExerciseDefinition, s: unknown): s is InventoryLessonState {
  const ids = nodeIdsFor(def);
  const selections: (string | null)[] = [null, ...def.graph.nodes.map((n) => n.id)];
  if (
    !hasExactKeys(s, ["lesson", "selected", "answer", "checked", "complete", "positions"]) ||
    typeof s.lesson !== "number" ||
    !Number.isInteger(s.lesson) ||
    s.lesson < 1 ||
    s.lesson > def.steps.length ||
    !selections.includes(s.selected as string | null) ||
    typeof s.checked !== "boolean" ||
    typeof s.complete !== "boolean" ||
    !hasExactKeys(s.positions, ids) ||
    !ids.every((id) => validPosition((s.positions as Record<string, unknown>)[id]))
  ) {
    return false;
  }
  const task = def.steps[s.lesson - 1];
  if (s.answer !== null && !task.choices.some((c) => c.id === s.answer)) return false;
  if (s.checked && (s.selected !== task.rubric.selection || s.answer !== task.rubric.answer)) return false;
  return s.complete === (s.lesson === def.steps.length && s.checked);
}

export function encodeProgress(def: InventoryExerciseDefinition, state: InventoryLessonState): string {
  if (!validateState(def, state)) throw new Error("Refusing to save invalid lesson state.");
  return JSON.stringify({ schemaVersion: PROGRESS_SCHEMA_VERSION, lessonVersion: def.progressVersion, state });
}

export function decodeProgress(
  def: InventoryExerciseDefinition,
  text: string | null,
): { state: InventoryLessonState; message: string; restored: boolean } {
  const reset = (message: string) => ({ state: initialState(def), message, restored: false });
  if (text === null) return reset("");
  if (typeof text !== "string" || text.length > 8000) return reset("Invalid saved progress was reset.");
  try {
    const data: unknown = JSON.parse(text);
    if (!hasExactKeys(data, ["schemaVersion", "lessonVersion", "state"])) {
      return reset("Invalid saved progress was reset.");
    }
    if (data.schemaVersion !== PROGRESS_SCHEMA_VERSION || data.lessonVersion !== def.progressVersion) {
      return reset("The lesson changed. Your old progress was reset.");
    }
    if (!validateState(def, data.state)) return reset("Invalid saved progress was reset.");
    return { state: data.state, message: "", restored: true };
  } catch {
    return reset("Saved progress could not be read and was reset.");
  }
}

export function progressFor(state: InventoryLessonState) {
  return { current: state.lesson, completed: state.lesson - 1 + (state.checked ? 1 : 0) };
}

export function checkAnswer(
  def: InventoryExerciseDefinition,
  state: InventoryLessonState,
): { correct: boolean; kind: "correct" | "incorrect" | "prerequisite"; message: string } {
  const task = def.steps[state.lesson - 1];
  const rubric = task.rubric;
  if (state.selected !== rubric.selection) return { correct: false, kind: "prerequisite", message: rubric.wrongSelection };
  if (state.answer === null) return { correct: false, kind: "prerequisite", message: def.text.noAnswer };
  return state.answer === rubric.answer
    ? { correct: true, kind: "correct", message: rubric.correct }
    : { correct: false, kind: "incorrect", message: rubric.incorrect };
}

export function transition(
  def: InventoryExerciseDefinition,
  state: InventoryLessonState,
  action: InventoryAction,
): { state: InventoryLessonState; message: string } {
  const unchanged = (message: string) => ({ state, message });
  const ids = nodeIdsFor(def);
  const selections: (string | null)[] = [null, ...def.graph.nodes.map((n) => n.id)];

  switch (action.type) {
    case "answer":
      if (!def.steps[state.lesson - 1].choices.some((c) => c.id === action.answer)) {
        return unchanged("Choose one of the answers.");
      }
      return { state: { ...state, answer: action.answer, checked: false, complete: false }, message: "" };
    case "connect":
      if (!selections.includes(action.selected)) {
        return unchanged("Connect a prepared type to the deposit rule.");
      }
      return { state: { ...state, selected: action.selected, checked: false, complete: false }, message: "" };
    case "check": {
      const result = checkAnswer(def, state);
      return {
        state: { ...state, checked: result.correct, complete: result.correct && state.lesson === def.steps.length },
        message: result.message,
      };
    }
    case "continue":
      if (!state.checked || state.lesson === def.steps.length) return unchanged("Finish this question first.");
      return {
        state: { ...state, lesson: state.lesson + 1, answer: null, checked: false, complete: false },
        message: "",
      };
    case "move":
      if (!ids.includes(action.id) || !validPosition(action.position)) {
        return unchanged("Keep nodes inside the canvas bounds.");
      }
      return {
        state: { ...state, positions: { ...state.positions, [action.id]: action.position } },
        message: "",
      };
    case "layout":
      return {
        state: { ...state, positions: initialState(def).positions },
        message: "Layout reset. The rule is unchanged.",
      };
    case "reset":
      return { state: initialState(def), message: "" };
  }
}

export function evaluateCase(def: InventoryExerciseDefinition, state: InventoryLessonState, caseId: string): CaseEvaluation {
  const entry = def.cases.find((c) => c.id === caseId);
  if (!entry) return { ok: false, message: "Choose a teaching case." };
  const generated = generateInventoryRule(graphFor(def, state));
  if (!generated.ok || !generated.normalised) {
    return { ok: false, message: "Connect one type before trying a case." };
  }
  const rulePasses = generated.normalised.allowedType === entry.itemType;
  const fuelName = def.graph.nodes.find((n) => n.typeId === entry.itemType)?.label ?? `Type ${entry.itemType}`;
  return {
    ok: true,
    rulePasses,
    blockers: [...entry.blockers],
    message: `${fuelName} ${rulePasses ? "matches" : "does not match"} the connected fuel. ${entry.detail}`,
  };
}

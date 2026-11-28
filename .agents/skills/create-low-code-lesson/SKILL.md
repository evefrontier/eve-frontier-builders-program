---
name: create-low-code-lesson
description: Guide and rules for creating an interactive low-code lesson in the EVE Frontier Builders Program curriculum using Storybook UI and low-code primitives.
---

# Create Low-Code Lesson

This skill defines the structure, UI rules, and verification steps for adding an interactive low-code lesson under `curriculum/lessons/pillar-1/` and `web/components/low-code/`.

## Curriculum Structure

1. **Course & Module:** Register the lesson slug in its module YAML under `curriculum/modules/<module>.yaml`, and ensure the module is listed in `curriculum/courses/<course>.yaml` (`pillar: 1`) and `curriculum/index.yaml`.
2. **Lesson Prose (`curriculum/lessons/pillar-1/<course>/<lesson>.md`):**
   - Frontmatter must include `description`, `duration`, and `exercise: <lesson>.yaml` (companion YAML in the same folder).
   - Start the body with a single `# Title` (stripped automatically by `web/lib/curriculum.ts` since `LessonView` renders the `<h1>`).
   - Include **conceptual Move code examples** (` ```move `) matching the generated code so learners see that the visual flow teaches real Sui Move concepts.
   - Pin and state the target `world-contracts` branch and commit in both the generator/UI and lesson prose, verify function signatures against that pinned revision, and clearly disclose when generated Move is uncompiled/not deployed.
   - Include an **Assumed preconditions** section that explicitly states we make those assumptions so learners can focus on **one code concept at a time**.
3. **Exercise Data (`curriculum/lessons/pillar-1/<course>/<lesson>.yaml`):**
   - Keep type IDs and u64 values as strings, never JavaScript numbers.
   - Define `schemaVersion`, `id`, `progressVersion`, `exercise`, `graph`, `steps` (with `choices` and `rubric`), and optional `cases`.

## Required Primitives (Do Not Invent Bespoke Shells)

Always reuse the Builders Program's Storybook primitives rather than creating custom CSS clip-path plates or custom node wrappers:

- **UI primitives (`@/components/ui`):** `Plate`, `Button`, `Tag`, `Select`, `Icon`, `Accordion`.
- **Low-code primitives (`@/components/low-code`):**
  - `PrimitiveConstant` (use `readOnly` + `compact` for constrained lesson constants).
  - `OperationNode` (pass a data-driven `CustomOperationSpec` for real contract operations).
  - `Socket` and `socketPortClassName` for typed handles (`execution`, `u64`, `item`, `boolean`).
  - `SourcePreview` with theme-aware Shiki Move highlighting (`move-highlight.ts`) for read-only generated code and node-to-line tracing.

## Workbench Layout & React Flow Rules

1. **Pane split:** Render lesson prose in `<main>` via `LessonMarkdown` and portal the stacked interactive workbench into `LessonView`'s Workbench `<aside>` via `<LessonWorkbench>`.
2. **Expanding canvas with safe resize recovery:**
   - Give the canvas container `relative min-h-96 flex-1 min-w-0` inside a `flex flex-1 flex-col` stack, and wrap `<ReactFlow>` in `<div className="absolute inset-0">` so `height: 100%` never collapses to `0px`.
   - Attach a `ResizeObserver` to the canvas container and call `flowInstance.fitView({ padding: 0.16, duration: 0 })` (via `requestAnimationFrame`) when the container recovers from collapsed (`0px`) or is resized, so hiding and reopening the Workbench pane never leaves nodes shrunk in a corner.
3. **Wire removal on canvas:** Render editable wires with a custom edge (`EdgeLabelRenderer`) showing a hover-only inline `×` box button (`<Icon name="cross" />`, also revealed on edge selection for keyboard/touch users), and handle `onEdgesChange` (`select` / `remove`) so `Backspace` / `Delete` works alongside keyboard buttons below the canvas.
4. **Progress storage:** Persist progress locally in `localStorage` with `useSyncExternalStore`, `schemaVersion`, and `progressVersion`. Do **not** display a noisy `"Progress restored in this browser."` notice during normal use; only display a status message on reset, version mismatch, or storage error.

## Question & Answer Feedback Rules

1. **Single-select radio buttons:**
   - Render custom-styled **circular** (`rounded-full`) radio buttons using a visually hidden native `<input type="radio" className="peer sr-only" />` — never square checkboxes that look like multi-select.
   - Use generous typography and touch targets: `text-step-1` for the question `<legend>`, `text-step-0` (`leading-snug`) for option labels, and `min-h-12` rows with `has-[:focus-visible]` keyboard focus rings.
2. **Correct & incorrect answer states with inline feedback:**
   - While selected (before checking), style the radio button and option border with the orange accent (`border-accent-text` / `bg-accent`).
   - Once checked and **correct**, change the selected radio button and option border from orange to **green (`border-success` / `bg-success`)**, and render the confirmation/explanation text **inline under the selected option** at readable size (`text-step--1 text-success`).
   - Once checked and **incorrect**, change the selected radio button and option border from orange to **red (`border-danger` / `bg-danger`)** while keeping the option label `text-foreground`, and render the explanation/retry text **inline under the selected option** at readable size (`text-step--1 text-danger`).
   - For canvas/wiring prerequisites (e.g. wrong or missing wire before checking), show the guidance below the actions at readable size (`text-step--1`) with a `border-warning` indicator.

## Verification

From `web/`:

```sh
node --test components/low-code/*.test.mjs
pnpm lint
pnpm exec next typegen && pnpm exec tsc --noEmit
pnpm build
pnpm build-storybook
```

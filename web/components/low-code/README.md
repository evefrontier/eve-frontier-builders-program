# Low-code UI previews

From `web/`:

- `pnpm install --frozen-lockfile`
- `pnpm storybook` — Components / Low Code; All precedes Playground.
- `pnpm build-storybook` — static preview.
- `node --test components/low-code/preview.test.mjs` — repeatable, zero-dependency pure-logic checks.
- `pnpm lint`, `pnpm exec next typegen`, `pnpm exec tsc --noEmit`, `pnpm build` — local validation. Type generation supplies Next's LayoutProps on a fresh checkout.

Start with CONSTANT_A and CONSTANT_B independently wired. Disconnect Dispense,
connect CONSTANT_A to it, and select or edit CONSTANT_A: its one declaration feeds
both quantity uses. Use the labelled connection controls without dragging.
Trace source buttons work by keyboard or pointer; matching lines have ▶ markers,
line numbers and bold text, not colour alone. Canvas node clicks select the same
correspondence. Delete a selected Value connection or use Disconnect input.
Execution flow is locked and has no source-highlighting promise.

Field text is retained exactly; surrounding whitespace and leading zeros are
accepted and source literals canonicalised. Zero through the u64 maximum is valid.
Invalid values never remove or prevent typed wiring. Any invalid displayed
constant, even unused, or any missing quantity input withholds source.

## Scope

This is a local Storybook increment, not a lesson route, full Move type checker,
contract generator, compiler, inventory checker, wallet or deployment UI.
The illustrative Move is **uncompiled and not the vending contract**.
Only copyable u64 fan-out is supported. Exercise quantities must still be positive;
the finalised contract snapshot and real-build acceptance gates remain prerequisites
for the complete exercise.

ReactFlow 12.12.0 was verified against npm's current release on 2026-10-24.
Its React/React DOM peers are >=17, compatible with this branch's React 19.
The exact version and sha512 tarball integrity are recorded in pnpm-lock.yaml.
Existing Storybook configuration, dependencies, fonts and theme decorators are retained.

Actual validation results are recorded in VALIDATION.md.

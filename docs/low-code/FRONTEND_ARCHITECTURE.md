# Low-Code Learning — Front-End Architecture

**Status:** Full exercise proposed; a UI-only Storybook preview is implemented and locally checked, with no real compiler or full exercise acceptance claimed.

**Learning scope and acceptance:** [EXAMPLE_EXERCISE.md](EXAMPLE_EXERCISE.md).

**Design boundary and future contract context:** [HLD.md](HLD.md).

## 1. One page, one learning loop

Deliver the Feral Data → EU-40 vending exercise as:

> ReactFlow nodes → corresponding real Move lines → a meaningful code change → real zktx compilation.

Node-to-code correspondence is a first-class feature. Wallets, live storage selection, transaction execution, and testnet deployment are not part of this initial implementation.

Use Next.js, React, TypeScript, Tailwind, Node.js, and **pnpm** in line with this repository's [tooling standards](../tools-and-standards.md). Use **ReactFlow (`@xyflow/react`)** and **zktx.io's `@zktx.io/sui-move-builder`**. The exercise is delivered inside the programme website in [`web/`](../web/); its route is defined by the course structure and is intentionally not prescribed here. This document describes the page as a responsibility bundle, route-agnostic, and mirrors the pinned versions in [`web/package.json`](../web/package.json) rather than introducing new tooling.

## 2. UI and teaching interaction

Use two primary panes, with instructions above and build feedback below:

- **Flow:** the fixed **Execution flow**, Exchange → Accept Feral Data → Dispense EU-40 → Complete exchange, plus **Primitive Constant** nodes (`Type` + `Value`) supplying the quantities. Select a node to edit its supported fields and read a short explanation; `Type` is restricted to `u64` and values are positive whole numbers. Learners may connect/disconnect **Value connections** from a Primitive Constant to either supported quantity input, including sharing one copyable `u64` output across both; each input has at most one source. These connections never change the Execution flow. Item identifiers and the storage reference render as locked, labelled fixture context, not editable fields.
- **Move source:** read-only, line-numbered generated source. Selecting a node highlights or scrolls to its mapped code region. Shared imports/signatures/resource scaffolding are labelled separately.
- **Build feedback:** an explicit Build button, progress, actionable compiler diagnostics, and **“Built, not deployed”** after a successful current build.

Ask the learner to edit the payment constant, find its generated constant and consuming rule, observe the new source, and rebuild. Repeat for the reward constant. Do not require a source editor, rich diff engine, reverse source-to-node navigation, or generic source-map framework. A simple emitter-owned node-ID-to-file/line-range mapping is sufficient.

Keep quantity controls keyboard accessible and provide a labelled node list/form alternative to canvas interaction. Do not rely on colour alone for selection or build status. Compiler errors with file/line information should navigate to the source; node association is useful where the mapping is available.

## 3. Small implementation boundary

```text
exercise/
  definition.ts             # starter flow, fixtures, explanations, allowed fields
  VendingExercise.tsx       # page, selected node, current revision, build state
  FlowEditor.tsx            # constrained ReactFlow view and quantity controls
  GeneratedMove.tsx         # line-numbered source and node-region highlighting
  generateMove.ts           # validation, reviewed template, file/line mapping
  compiler.worker.ts        # zktx initialization, actual build, diagnostics
  vendor/                   # pinned contracts snapshot + hash manifest (offline)
  scripts/refresh-vendor.mjs # re-vendor the snapshot from a pinned contracts commit
```

These are responsibilities, not mandatory file boundaries or new packages. A few pure functions and local React state are enough. No world SDK runtime adapter, query cache, backend, database, registry, or global state framework is needed.

In Next.js, keep the canvas and worker under a client boundary. Dynamically load ReactFlow without SSR from a client component. Load the compiler when the learner first builds, not on ordinary instructional pages. Use a static exercise route; no Server Actions or runtime API routes are required.

## 4. Generation and node-to-line mapping

The checked-in exercise definition contains locked, labelled fixture item identifiers and the storage reference, a fixed Execution flow and set of Primitive Constant nodes with learner-editable Value connections, explanations, the vendor manifest, and a reviewed Move template. No chain reads or live entity/component selection are required. Item identities are expected to become typed on-chain data, but that is not yet implemented; deriving them on-chain is future work. Fixture data must not appear to be verified live assets.

Validate Primitive Constant `Type` (only `u64` in this version), positive whole-number values, supported Move integer bounds, and the constrained node/connection structure. Use `bigint` for numeric handling and decimal strings when serializing; no floating-point quantities or arbitrary injected Move identifiers/source.

On valid semantic changes, emit:

- Complete deterministic package files, including the required Move manifest.
- Quantities emitted as module-level constants consumed by real validation and reward logic—not changes confined to comments, labels, or unused constants.
- A small mapping from conceptual node IDs to the generated file/line ranges, recorded while emitting the source.

Keep shared scaffold regions distinct and explain where client invocation would sit outside Move. No one-to-one mapping between every line and a visible node is necessary. If generation is invalid, show the errors and mark retained source stale; do not silently compile an older valid program.

Keep canvas positions separate from semantic configuration. A simple revision counter tracks code changes; dragging a node must not change source or invalidate a build. A reset-to-starter action is sufficient initially; persistence, imports, exports, and migrations can wait.

## 5. Real compilation without deployment infrastructure

The worker receives the generated package files and their revision ID. It initializes `@zktx.io/sui-move-builder`, compiles those actual files against the **vendored, fully offline snapshot of the v1 world contracts** (minimal source closure served through the builder's local-snapshot fetcher and verified against the checked-in hash manifest), and returns progress, compiler diagnostics, and the resulting module/dependency bytes. Render errors as text, not trusted HTML.

Compile the same source revision shown in the viewer. Do not supply canned success, substitute precompiled modules, or use mock/stub dependencies while claiming a real supported-target build. Record the compiler/dependency target — the contracts commit and the `sui-move-builder` version — and display it in the UI so users know exactly what was checked. Compiler compatibility with the template and the vendored snapshot must be proven by actual builds before calling the exercise ready, including one real browser build of the generated package in a production build; if browser compilation proves too slow, the accepted behaviour is an honest timeout with an actionable message — never a remote compiler fallback.

Use a small state model:

```text
editing → source ready → building → built / build failed
```

Invalid configuration prevents Build. Semantic changes clear current-build success; ignore late responses for old revisions. Keep editing/source inspection usable after failure. Bound input sizes and give Cancel/timeout a worker-termination path so a synchronous WASM build cannot freeze the UI. Allow a clean retry, not an automatic remote compiler fallback.

The vendor snapshot is refreshed by `scripts/refresh-vendor.mjs`: an operator runs it locally with network access against a pinned contracts commit, it rewrites the vendored files and the manifest (source repo, commit, per-file SHA-256), and the result is committed in a reviewed change. Runtime and CI never fetch — they verify manifest hashes only. Pin exact compatible package versions with integrity in the pnpm lockfile. Bundle and cryptographically verify the WASM and the vendored source closure; do not depend on floating CDN artifacts or learner GitHub credentials. Source-fetching during asset preparation is different from a runtime RPC/chain dependency.

Test the static production build for worker/WASM asset paths, MIME types, and CSP permissions. Allow only the WASM/worker capabilities actually needed; do not introduce broad `unsafe-eval` permissions by default. No signing keys, service secrets, wallet connection, or testnet funds are required.

A successful build establishes compiler acceptance, **not** correct runtime economics, a published package, deployed ABI compatibility, or successful game interaction. Do not add inactive wallet/deploy controls suggesting otherwise; describe testnet deployment as a future lesson.

## 6. Delivery and verification

### UI-only preview delivered ahead of the full exercise

The execution spine means the same fixed Execution flow; only Value connections are learner-authored.

The [local previews](../../web/components/low-code/README.md) extend the existing Storybook under `Components/Low Code/...`. They use shared Plate/Field/Button presentations, thin ReactFlow handles, story-local state, and small pure validation/connection/source modules. Fixed-name CONSTANT_A and CONSTANT_B begin independently wired. Labelled keyboard controls invoke the same connection rules as canvas interaction, and Trace source buttons select the same correspondence as node clicks. Invalid text does not remove or prevent typed wiring.

The primitive accepts the full `u64` range, trims surrounding whitespace for validation, accepts leading zeros, retains entered text and canonicalises source literals. This is distinct from the full exercise's positive-quantity rule. Both displayed constants are declared, including unused ones; any invalid constant or missing quantity input withholds the snippet. Only constants and Accept/Dispense quantity uses have source correspondence. The example is illustrative, uncompiled and not the vending contract; no production generation, worker/compiler, wallet or inventory enforcement is included.

Run `pnpm storybook` or `pnpm build-storybook` from `web/`. Focused zero-dependency checks run with `node --test components/low-code/preview.test.mjs`; [validation results](../../web/components/low-code/VALIDATION.md) record executed commands and browser checks. These checks do not replace the full-exercise gates below or its finalised vendored-snapshot prerequisite.

### Full exercise acceptance (not delivered by the preview)

| Work | Acceptance evidence |
|---|---|
| Constrained flow and readable source | Each conceptual node selects the relevant Move region; shared scaffolding is explained; keyboard controls work. |
| Semantic generation | Payment/reward changes alter the appropriate consumed rules/configuration; deterministic output and correct source ranges are tested; layout-only edits do not alter code. |
| Real zktx build | The generated package compiles against the vendored v1 world snapshot; compiler failures, worker cancellation, old-revision results, and slow builds never produce current success. |
| Learner outcome | The learner can explain node → source → compilation and distinguish a build from deployment. |

Gates: unit tests for the pure template/validation/mapping code (vitest), a Node-side integration check that runs the real compiler against the snapshot, and one Playwright end-to-end spec of the complete learning loop against `next build` + `next start` (not `next dev`). CI runs `lint`, `build`, `test`, and `e2e`. Mocks may test error handling, but cannot satisfy the successful-build criterion. Compilation alone is not sufficient evidence that the node's intended rule appears in the program: test the generated code's meaningful structure as well.

Provide pnpm lint/build/test/e2e gates consistent with repository conventions. Initial completion is the acceptance set in [EXAMPLE_EXERCISE.md](EXAMPLE_EXERCISE.md#acceptance-checks), not a successful inventory transaction. Documentation changes do not establish that those application checks have passed.

## 7. Frontier Flow patterns retained—not its product scope

The prior review was static, at Frontier Flow `1d34f6282e9fa51003073210d9faff0e5e0cd80e`, with socket inspection at the HLD's earlier baseline. No upstream tests/builds were executed.

Retain these narrow patterns:

- [Separate validation/generation/compilation](https://github.com/Scetrov/frontier-flow/blob/1d34f6282e9fa51003073210d9faff0e5e0cd80e/src/compiler/pipeline.ts), implemented here as a fixed reviewed template rather than a general compiler framework.
- [Stale-build handling](https://github.com/Scetrov/frontier-flow/blob/1d34f6282e9fa51003073210d9faff0e5e0cd80e/src/hooks/useAutoCompile.ts), using revision checks without importing full application orchestration.
- [Lazy zktx initialization and WASM integrity](https://github.com/Scetrov/frontier-flow/blob/1d34f6282e9fa51003073210d9faff0e5e0cd80e/src/compiler/moveBuilderLite.ts), isolated behind the worker.
- [Typed connections](https://github.com/Scetrov/frontier-flow/blob/061e7c88387cb6605aec36a3c0e9ed11b8dbe1fe/src/utils/socketTypes.ts), restricted to this exercise rather than copying permissive `any` or legacy gameplay types.

Use the [zktx compiler library](https://github.com/zktx-io/sui-move-builder), not an embedded PTB Builder or another wallet product. Preserve license obligations for reused code. Do not transplant Frontier Flow's Bun/Vite toolchain, deployment orchestration, world shims, GitHub OAuth, or general contract library.

Future testnet publishing/execution will need a separate design increment using the HLD's retained contract constraints. Do not implement that infrastructure speculatively in this learning page.

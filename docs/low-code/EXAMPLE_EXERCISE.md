# Example Exercise: Feral Data Vending Machine

## Goal

Build a mental model of how **high-level low-code concepts become real Sui Move lines, which are then compiled**. Testnet deployment is a future lesson, not an initial requirement.

The representative story is a vending machine: a player supplies **Feral Data** to a **Smart Storage Unit** and receives a configured small amount of **EU-40**. Initially, learners express and compile that behaviour; they do not move real assets or operate a live vending service.

This lesson belongs to the low-code track: First Move teaches Move concepts, while low-code lessons teach broader EVE Frontier patterns. This exercise assumes no prior Move knowledge.

[HLD.md](HLD.md) defines the design boundary and relevant future contract constraints. [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md) defines the minimal teaching UI and compilation pipeline.

## Starter flow

```text
Exchange
  → Accept exact Feral Data payment
  → Dispense exact EU-40 reward
  → Complete exchange
```

Use a scaffolded flow with locked, labelled item fixtures and editable payment/reward quantities. Quantities are set through **Primitive Constant** nodes — `Type` + `Value`, positive whole numbers, with `Type` restricted to `u64` in this version; the node outputs only that value. This document does not prescribe an economic price. Item identifiers and the Smart Storage Unit reference are locked fixtures supplied by the exercise definition, labelled as such, never presented as verified live assets. Item identities are expected to become typed on-chain data in the v1 world, but that is not yet implemented; deriving them on-chain belongs to the future testnet lesson.

The nodes represent explicit invocation, payment, reward, and completion. The Exchange node is not an automatic inventory-deposit listener. In a future live implementation, an ordinary deposit through an unrelated inventory interface would not itself invoke this exchange.

## Learner journey

1. Read the offer and explain the roles of payment and reward.
2. Select **Accept Feral Data** and see its corresponding generated Move lines highlighted, with a short explanation.
3. Edit the payment **Primitive Constant** node's value and observe that quantity in the generated constant and the rule that consumes it.
4. Select the reward **Primitive Constant** node and **Dispense EU-40**, set a small reward value, and identify their source regions.
5. Inspect **Exchange** and **Complete exchange**, distinguishing the Move invocation/completion code from client controls and shared scaffolding.
6. Change a constant's value and observe the relevant source change. Moving a node on the canvas should not change code.
7. Press **Build** to compile the displayed generated package with zktx.io's `@zktx.io/sui-move-builder`.
8. Read actual compiler feedback and the successful **“Built, not deployed”** status. Explain why this is different from a running vending machine.

The generated package must contain meaningful real Move, not pseudocode, comments-only substitutions, unused quantity constants, or TypeScript SDK calls presented as Move. Shared imports, signatures, and resource/request scaffolding may remain locked, but must be visible and explained. The learner is not asked to write Move manually.

## Minimum initial implementation

- One guided page using the repository-aligned React, TypeScript, Tailwind, and pnpm stack.
- ReactFlow with the starter flow nodes, Primitive Constant nodes, and bounded value controls.
- A line-numbered generated Move panel with node-to-source navigation/highlighting.
- One reviewed generation template producing complete deterministic package files.
- Real zktx compilation in a worker against a vendored, fully offline snapshot of the v1 world contracts, with diagnostics, cancellation/retry, and stale-result handling.
- A checked-in refresh script that re-vendors the contracts snapshot from a pinned commit, with a hash manifest checked in.
- Keyboard-accessible controls and a reset-to-starter action.

No wallet, RPC, live entity/inventory selection, on-chain balance, transaction form, package publication, database, or custom hosting pipeline is needed. Once compiler/source assets are available, the learning loop must not depend on chain access.

## Acceptance checks

### Concepts relate to code

- Selecting each conceptual node identifies its relevant generated Move lines.
- Payment/reward quantities affect meaningful generated rules or configuration consumed by those rules, not just labels or comments.
- Changing one quantity updates the relevant code; layout-only edits do not.
- Shared scaffolding is distinguished from node-specific code and explained without inventing a one-to-one mapping for every line.

### The displayed program compiles

- The current valid generated package builds with the real zktx compiler against the vendored v1 world snapshot, and the UI states the snapshot identity.
- The successful result belongs to the displayed revision, not a precompiled artifact or earlier valid graph.
- A real browser build of the generated package against the snapshot succeeds in a production build; excessive compile time surfaces as an honest timeout, never a remote fallback.
- Invalid configuration prevents Build; compiler failures produce actionable feedback rather than success.
- Editing semantic values invalidates previous success, and late worker results cannot restore it for stale code.

### The learner understands the boundary

- The learner can trace a node to source, explain a quantity change, and distinguish source generation from compilation.
- The UI states that the code has not been deployed or executed. No asset transfers, testnet availability, or economic correctness are implied by a successful build.
- Completion requires no wallet, testnet funds, or game integration.

Gates are unit tests for the template/validation/mapping code (vitest), a Node-side integration build with the real compiler, and one Playwright end-to-end check of the learning loop against the production build. Unit and integration tests must verify meaningful generated rules and node/source mappings in addition to a real build. Compilation alone does not demonstrate runtime correctness.

## Future extension: deploy and try it on a testnet

A later lesson can publish the generated program and test an actual vending exchange. That requires separate verification of supported dependencies/deployed ABI, item identifiers (expected to become typed on-chain data, not yet implemented), inventory component references, owner configuration, player authorization, wallets, and docking/proof integration.

The future exchange must make payment and reward atomic, enforce quantities/access on-chain, complete requests, route Item resources, and return borrowed capabilities. Missing integration support must not be worked around by splitting payment and reward into separate transactions. The HLD retains the relevant contract evidence and limitations.

These future behaviours are not initial acceptance gates. First establish the mental model: **concept → node → Move lines → compilation**.

# Preview validation — 2026-10-24

This records local UI-preview checks, **not** production exercise acceptance,
Move compiler acceptance, inventory enforcement or deployment.

## Commands actually executed

From `web/`, Node 24.21.0 and pnpm 10.33.2:

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed before adding ReactFlow. |
| `pnpm exec next typegen` | Passed; generated missing `LayoutProps` on the fresh checkout. |
| `pnpm lint` | Passed. |
| `pnpm exec tsc --noEmit` | Passed after type generation and implementation fixes. |
| `pnpm build` | Passed; existing `/` and `/_not-found` routes built. |
| `pnpm build-storybook` | Passed; existing dependency `use client` bundling warnings and chunk-size advisory remain. |
| `node --test components/low-code/preview.test.mjs` | Passed: 11 tests, 0 failures. |

All four lint/type/build commands and the focused checks were rerun successfully
after the accessibility fixes and final connection-feedback change. No new test
infrastructure or dependencies were used for the focused checks.

## Browser inspection actually performed

Served `storybook-static` locally on port 6006. Inspected Chromium 155 through
Chrome DevTools, including native mouse and keyboard event dispatch. Temporary
browser scripts/screenshots lived outside the repository, not as a new test suite.

- Light/dark Canvas and Docs: confirmed themed node surfaces, fonts, fixed flow,
  labelled circular value sockets versus square execution ports/dashed arrows,
  fixture labels, source disclaimer and matching-line markers. Docs retains its
  existing Storybook chrome while the rendered stories follow the chosen theme.
- Constant and operation All galleries: five constant states and six operation
  presentations rendered in both themes. Existing axe-core checks on the story
  root (WCAG 2 A/AA and 2.1 AA tags) reported zero violations in both themes.
- Existing Accessibility addon on composed Canvas: **0 violations, 27 passes,
  2 inconclusive**. Inconclusive results still require human judgement; this is
  not a comprehensive accessibility certification.
- Initial composed axe inspection found prohibited labels on generic handle
  divs and attribution-link contrast. Added group roles to labelled value
  sockets and themed the attribution link. Rebuilt and reran: zero WCAG-tagged
  violations on the composed story root in light and dark.
- Pointer drags connected CONSTANT_A to a disconnected Dispense input while
  retaining Accept, giving two uses of one declaration. Duplicate, occupied-input,
  output-to-output and value-to-execution attempts left all five initial edges
  unchanged and displayed rejection feedback.
- Labelled controls activated with Enter disconnected the chosen quantity,
  withheld source, and reconnected it with CONSTANT_A. Tab moved from the
  Primitive Constant selector to the quantity selector.
- Keyboard Trace source selection on CONSTANT_A reported lines **2, 6, 7** after
  reuse; selecting Accept/Dispense reported only its quantity-use line.
  These buttons call the same `setSelection` path as canvas node clicks.
- Code inspection confirmed canvas and form connections call `connectValue`
  and `connectionError`; both deletion paths call `disconnectValue`. Invalid
  field text is intentionally absent from those connection-rule inputs.
- Editing unused CONSTANT_B to invalid text withheld source, identified
  CONSTANT_B, and retained all five edges. Editing it to ` 00042 ` retained that
  exact field text and emitted `42` in its declaration.
- Dragging a node left rendered source text unchanged.
- Verified fields stay inside the node surface after fixing grid-child minimum
  sizing. Handles are siblings of the clipped Plate. A focused Trace source
  button produced a solid outer section outline with `clip-path: none`.
- Forced-colours plus reduced-motion emulation: inspected readable labels,
  visible sockets/focus and distinct solid/dashed edges; media queries were
  active, outer focus/handle wrappers remained unclipped, and button transition
  duration was `0s`. Correspondence retains ▶, line numbers and bold text.

Pure checks additionally cover exact u64 maximum/overflow, forbidden syntax,
whitespace/leading zeros, invalid-value wiring, invalid unused constants, missing
inputs, source ownership and layout independence. Browser inspection is bounded
manual/devtools verification, not a committed automated end-to-end gate.

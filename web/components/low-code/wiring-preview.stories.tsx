import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WiringPreview } from "./wiring-preview";

const meta = {
  title: "Components/Low Code/ReactFlow Working Example",
  component: WiringPreview,
  parameters: {
    docs: {
      description: {
        component:
          "Working ReactFlow node editor implementing high-level Move/SDK primitives (`entity::start_request`, `inventory::require_item`, `inventory::transfer_item`, `request::complete_request`) with typed sockets (`execution`, `u64`, `item`, `boolean`), contour-following Plate styling, and wireable statement-order execution flow.",
      },
    },
  },
  args: {
    showCodePreview: true,
    showControls: true,
    canvasOnly: false,
  },
  argTypes: {
    showCodePreview: { description: "Display the generated Move source code inspection pane below the canvas." },
    showControls: { description: "Display the accessible dropdown controls for keyboard and screen-reader users." },
    canvasOnly: { description: "Render only the design surface (nodes, edges, background) without surrounding documentation panels." },
  },
} satisfies Meta<typeof WiringPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ReactFlow low-code working example:
 * - Interactive node dragging, panning, zooming, minimap, and dot background
 * - Coloured, shaped typed sockets (▸ exec, ● u64, ◆ item, ▲ bool)
 * - Linear Request execution flow (`exec-out` → `exec-in`)
 * - Live uncompiled Move source generation reflecting statement execution order
 */
export const All: Story = {};

export const Playground: Story = {};

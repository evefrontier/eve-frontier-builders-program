import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WiringPreview } from "./wiring-preview";

const meta = {
  title: "Components/Low Code/Wiring Preview",
  component: WiringPreview,
  parameters: { docs: { description: { component: "UI-only learning preview: reuse a u64 Primitive Constant and trace its declaration and quantity uses. Illustrative source is uncompiled and is not the vending contract." } } },
} satisfies Meta<typeof WiringPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const All: Story = {};
export const Playground: Story = {};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { parse } from "yaml";
import rawExercise from "../../../curriculum/lessons/pillar-1/low-code-smart-assemblies/inventory-deposit-rule.yaml?raw";
import { Section } from "@/stories/section";
import { InventoryWorkbench } from "./inventory-workbench";
import { validateInventoryExercise } from "./inventory-exercise";

const exercise = validateInventoryExercise(parse(rawExercise), "inventory-deposit-rule.yaml");

const meta = {
  title: "Components/Low Code/Inventory Workbench",
  component: InventoryWorkbench,
  args: {
    exercise,
    storageKey: "storybook.inventory-workbench",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto flex min-h-[85vh] max-w-120 flex-col border border-line bg-card">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InventoryWorkbench>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: (args) => (
    <Section title="Inventory deposit-rule workbench">
      <InventoryWorkbench {...args} />
    </Section>
  ),
};

export const Playground: Story = {};

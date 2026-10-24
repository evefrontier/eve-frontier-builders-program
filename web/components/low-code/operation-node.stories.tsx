import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { OperationNode, operationRoles } from "./nodes";

const meta = {
  title: "Components/Low Code/Operation Node",
  component: OperationNode,
  args: { role: "Accept Feral Data", connected: true, selected: false },
  argTypes: { role: { control: "select", options: operationRoles } },
} satisfies Meta<typeof OperationNode>;
export default meta;
type Story = StoryObj<typeof meta>;
export const All: Story = {
  render: () => <Section title="Fixed Execution flow roles">
    <div className="flex flex-wrap gap-l p-s">
      {operationRoles.map(role => <OperationNode key={role} role={role} connected />)}
      <OperationNode role="Accept Feral Data" connected={false} />
      <OperationNode role="Dispense EU-40" selected />
    </div>
  </Section>,
};
export const Playground: Story = {};

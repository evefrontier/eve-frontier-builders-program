import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Section } from "@/stories/section";
import { PrimitiveConstant } from "./nodes";

const meta = {
  title: "Components/Low Code/Primitive Constant",
  component: PrimitiveConstant,
  args: { name: "CONSTANT_A", value: "42", onChange: fn(), selected: false, connected: false },
  render: function Editable(args) {
    const [value, setValue] = useState(args.value);
    return <PrimitiveConstant {...args} value={value} onChange={text => { setValue(text); args.onChange(text); }} />;
  },
} satisfies Meta<typeof PrimitiveConstant>;
export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: (args) => <Section title="Primitive Constant states">
    <div className="flex flex-wrap gap-l p-s">
      <PrimitiveConstant {...args} />
      <PrimitiveConstant {...args} name="SELECTED" selected connected />
      <PrimitiveConstant {...args} name="INVALID" value="18446744073709551616" />
      <PrimitiveConstant {...args} name="ZERO" value="0" />
      <PrimitiveConstant {...args} name="MAXIMUM" value="18446744073709551615" />
    </div>
  </Section>,
};
export const Playground: Story = {};

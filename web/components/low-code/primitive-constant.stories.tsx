import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Section } from "@/stories/section";
import { PrimitiveConstant } from "./nodes";
import { socketTypes } from "./connections.mjs";

type Props = ComponentProps<typeof PrimitiveConstant>;

/* Holds the edits so every card is live; keyed on its args so the controls still apply */
function Editable({ name = "CONSTANT_A", dataType = "u64", value, onChange, onNameChange, onTypeChange, ...rest }: Props) {
  const [state, setState] = useState({ name, dataType, value });
  return (
    <PrimitiveConstant
      {...rest}
      {...state}
      onChange={text => {
        setState(current => ({ ...current, value: text }));
        onChange(text);
      }}
      onNameChange={next => {
        setState(current => ({ ...current, name: next }));
        onNameChange?.(next);
      }}
      onTypeChange={next => {
        setState(current => ({ ...current, dataType: next }));
        onTypeChange?.(next);
      }}
    />
  );
}

const live = (args: Props) => <Editable key={`${args.name}-${args.dataType}-${args.value}`} {...args} />;

const meta = {
  title: "Components/Low Code/Primitive Constant",
  component: PrimitiveConstant,
  args: {
    name: "CONSTANT_A",
    dataType: "u64",
    value: "42",
    onChange: fn(),
    onNameChange: fn(),
    onTypeChange: fn(),
    selected: false,
    connected: false,
  },
  argTypes: { dataType: { control: "select", options: socketTypes } },
  render: live,
} satisfies Meta<typeof PrimitiveConstant>;
export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: args => (
    <Section title="Primitive Constant states">
      <div className="flex flex-wrap gap-l p-s">
        {live(args)}
        {live({ ...args, name: "IS_ACTIVE", dataType: "boolean", value: "true" })}
        {live({ ...args, name: "FUEL_ITEM", dataType: "item", value: "EU_40" })}
        {live({ ...args, name: "SELECTED", selected: true, connected: true })}
        {live({ ...args, name: "INVALID", value: "18446744073709551616" })}
        {live({ ...args, name: "ZERO", value: "0" })}
        {live({ ...args, name: "MAXIMUM", value: "18446744073709551615" })}
      </div>
    </Section>
  ),
};
export const Playground: Story = {};

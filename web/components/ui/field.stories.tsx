import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Section } from "@/stories/section";
import { Field, fieldTypes, type FieldProps } from "./field";
import { NavItem, NavList } from "./nav-item";

const states: { label: string; props: Partial<FieldProps> }[] = [
  { label: "Empty", props: {} },
  { label: "With a value", props: { defaultValue: "Smart Assembly" } },
  { label: "Shortcut", props: { shortcut: "/" } },
  { label: "Letter shortcut", props: { shortcut: "k" } },
  { label: "Disabled", props: { disabled: true } },
  { label: "Disabled with a value", props: { disabled: true, defaultValue: "Smart Assembly" } },
];

const meta = {
  title: "Forms/Field",
  component: Field,
  args: {
    placeholder: "Search",
    "aria-label": "Search",
    interlock: false,
    disabled: false,
    onChange: fn(),
  },
  argTypes: {
    interlock: { control: "boolean" },
    disabled: { control: "boolean" },
    shortcut: { control: "text" },
    type: { control: "radio", options: fieldTypes },
  },
  render: (args) => (
    <div className="max-w-sm">
      <Field {...args} />
    </div>
  ),
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every state, and interlocked after a NavList. Typing, clearing and focus are live. */
export const All: Story = {
  render: (args) => (
    <div className="grid gap-l">
      <Section title="states">
        <div className="grid max-w-sm gap-s">
          {states.map(({ label, props }) => (
            <div key={label} className="grid gap-3xs">
              <code className="text-step--2 text-muted">{label}</code>
              <Field {...args} {...props} />
            </div>
          ))}
        </div>
      </Section>
      <Section title="interlocked after a nav list">
        <div className="flex items-center">
          <NavList aria-label="Example">
            <NavItem href="#">Pathways</NavItem>
            <NavItem href="#">Courses</NavItem>
          </NavList>
          <Field {...args} interlock shortcut="/" className="w-72" />
        </div>
      </Section>
    </div>
  ),
};

export const Playground: Story = {};

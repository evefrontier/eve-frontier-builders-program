import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Section } from "@/stories/section";
import { Plate } from "./plate";
import { Select, type SelectProps } from "./select";

const sort = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "shortest", label: "Shortest first" },
  { value: "longest", label: "Longest first" },
  { value: "a-z", label: "A–Z" },
  { value: "completed", label: "Most completed", disabled: true, note: "Soon" },
  { value: "rated", label: "Highest rated", disabled: true, note: "Needs more reviews" },
];

const topics = [
  { label: "Game", options: [
    { value: "economy", label: "Game & economy" },
    { value: "assemblies", label: "Smart Assemblies" },
  ] },
  { label: "Chain", options: [
    { value: "move", label: "Sui & Move" },
    { value: "wallet", label: "Wallet & identity" },
    { value: "tools", label: "dApps & tools" },
  ] },
];

const networks = [
  { value: "mainnet", label: "Mainnet" },
  { value: "testnet", label: "Testnet" },
  { value: "devnet", label: "Devnet" },
  { value: "localnet", label: "Localnet" },
];

const tools = [
  { value: "explorer", label: "Explorer", note: "Free" },
  { value: "indexer", label: "Indexer", disabled: true, note: "Coming in season two" },
  { value: "deployer", label: "Deployer", disabled: true, note: "Needs a connected wallet" },
  { value: "inspector", label: "Transaction inspector", disabled: true, note: "Admins only" },
];

const modules = [
  { value: "intro", label: "What a builder does" },
  { value: "assemblies", label: "Smart Assemblies" },
  { value: "move", label: "Writing Move" },
  { value: "deploy", label: "Deploying to testnet" },
  { value: "economy", label: "Running an economy" },
];

const states: { label: string; props: SelectProps }[] = [
  { label: "With a value", props: { label: "Sort by", options: sort, defaultValue: "newest" } },
  { label: "Placeholder", props: { label: "Topic", options: topics, placeholder: "Choose a topic" } },
  {
    label: "Disabled",
    props: { label: "Module", options: modules, placeholder: "Choose a module", disabled: true, description: "Choose a course first." },
  },
  {
    label: "Read-only",
    props: { label: "Network", options: networks, defaultValue: "testnet", readOnly: true, description: "Set by this course." },
  },
  {
    label: "Error",
    props: { label: "Topic", options: topics, placeholder: "Choose a topic", error: "Choose a topic to continue." },
  },
  { label: "Loading", props: { label: "Sort by", options: sort, defaultValue: "newest", loading: true } },
];

/* An open list puts Base UI's focus guards, hidden spans that return Tab to
  the field, into the page; axe reads them as hidden focusable content */
const guards = { a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } } };

const meta = {
  title: "Forms/Select",
  component: Select,
  args: {
    label: "Network",
    options: networks,
    defaultValue: "testnet",
    placeholder: "Choose",
    numbered: false,
    grain: true,
    disabled: false,
    readOnly: false,
    loading: false,
    onValueChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    error: { control: "text" },
    numbered: { control: "boolean" },
    grain: { control: "boolean" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    readOnly: { control: "boolean" },
    description: { control: "text" },
    options: { table: { disable: true } },
    value: { table: { disable: true } },
  },
  render: (args) => (
    <div className="max-w-sm">
      <Select {...args} />
    </div>
  ),
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every state of the field. Hover, focus and opening are live: click, or press Enter, Space or an arrow. */
export const All: Story = {
  render: (args) => (
    <div className="grid gap-l">
      <Section title="states">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] items-start gap-m">
          {states.map(({ label, props }) => (
            <div key={label} className="grid gap-3xs">
              <code className="text-step--2 text-muted">{label}</code>
              <Select {...props} onValueChange={args.onValueChange} />
            </div>
          ))}
        </div>
      </Section>
      <Section title="numbered, where the order means something">
        <div className="grid max-w-sm gap-m">
          <Select label="Module" options={modules} defaultValue="move" numbered onValueChange={args.onValueChange} />
          <Select label="Module" options={modules} placeholder="Choose a module" numbered onValueChange={args.onValueChange} />
          <Select label="Topic" options={topics} defaultValue="move" numbered onValueChange={args.onValueChange} />
        </div>
      </Section>
      <Section title="with grain and without">
        <div className="grid max-w-sm gap-m">
          <Select label="Network" options={networks} defaultValue="testnet" onValueChange={args.onValueChange} />
          <Select label="Network" options={networks} defaultValue="testnet" grain={false} onValueChange={args.onValueChange} />
        </div>
      </Section>
      <Section title="notes, short and long">
        <div className="flex flex-wrap items-start gap-m">
          <Select label="Tool, narrow" options={tools} defaultValue="explorer" className="w-56" onValueChange={args.onValueChange} />
          <Select label="Tool, wide" options={tools} defaultValue="explorer" className="w-full max-w-md" onValueChange={args.onValueChange} />
        </div>
      </Section>
      <Section title="grouped, with a disabled option">
        <div className="grid max-w-sm gap-m">
          <Select label="Topic" options={topics} defaultValue="move" onValueChange={args.onValueChange} />
          <Select label="Sort by" options={sort} defaultValue="shortest" onValueChange={args.onValueChange} />
        </div>
      </Section>
    </div>
  ),
};

/** Numbered, open from the keyboard, so the chosen row carries the keyboard ring. Arrows, Home and End move; Enter picks; Escape closes. */
export const Open: Story = {
  args: { label: "Module", options: modules, defaultValue: "move", numbered: true },
  parameters: { ...guards, docs: { story: { inline: false, height: "320px" } } },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

/** With no room below, the list opens over the field, stopping where the field's cut begins, and takes a top-right cut of its own. */
export const OpensUpward: Story = {
  parameters: { ...guards, layout: "fullscreen", docs: { story: { inline: false, height: "360px" } } },
  render: (args) => (
    <div className="flex h-dvh items-end p-s">
      <div className="w-full max-w-sm">
        <Select {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
  },
};

/** On a panel in the accordions' plate: the field's hairline still parts it from the card. */
export const InAPanel: Story = {
  render: (args) => (
    <Plate as="section" corners="tr-bl" cut="md" className="grid max-w-md gap-s p-m">
      <h3 className="text-step-0">Deploy</h3>
      <Select {...args} />
      <Select label="Topic" options={topics} placeholder="Choose a topic" onValueChange={args.onValueChange} />
    </Plate>
  ),
};

export const Playground: Story = {};

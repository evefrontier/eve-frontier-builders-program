import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { Tag } from "./tag";

const meta = {
  title: "Components/Tag",
  component: Tag,
  args: { children: "Sui & Move" },
  argTypes: {
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

/** One label, a row of them as a glossary term shows its topics, and a long label. */
export const All: Story = {
  render: (args) => (
    <div className="grid gap-l">
      <Section title="Single">
        <div>
          <Tag {...args} />
        </div>
      </Section>
      <Section title="A term's topics">
        <p className="flex flex-wrap gap-2xs">
          <Tag>Smart Assemblies</Tag>
          <Tag>Sui & Move</Tag>
          <Tag>Wallet & identity</Tag>
        </p>
      </Section>
      <Section title="On a card">
        <div className="bg-card p-m">
          <Tag {...args} />
        </div>
      </Section>
    </div>
  ),
};

export const Playground: Story = {};

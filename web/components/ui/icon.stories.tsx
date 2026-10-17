import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { Icon, iconNames } from "./icon";

/* Whole multiples of the 5 × 5 grid, so every cell stays crisp */
const sizes = [
  { label: "10px", className: "size-2.5" },
  { label: "15px", className: "size-[15px]" },
  { label: "20px", className: "size-5" },
  { label: "40px", className: "size-10" },
];

const meta = {
  title: "Foundation/Icons",
  component: Icon,
  args: {
    name: "cross",
    className: "size-5 text-accent",
  },
  argTypes: {
    name: { control: "select", options: iconNames },
    className: { control: "text" },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every icon at each crisp size, and the labelled form. Icons take the current text colour. */
export const All: Story = {
  render: () => (
    <div className="grid gap-l">
      <Section title="library">
        <div className="flex flex-wrap gap-m">
          {iconNames.map((name) => (
            <div key={name} className="grid w-28 justify-items-start gap-xs">
              <Icon name={name} className="size-10 text-foreground" />
              <code className="text-step--2 text-muted">{name}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section title="sizes">
        <div className="grid gap-s">
          {sizes.map(({ label, className }) => (
            <div key={label} className="flex items-center gap-m">
              <code className="w-12 text-step--2 text-muted">{label}</code>
              {iconNames.map((name) => (
                <Icon key={name} name={name} className={`${className} text-accent`} />
              ))}
            </div>
          ))}
        </div>
      </Section>
      <Section title="decorative and labelled">
        <div className="flex items-center gap-m">
          <Icon name="cross" className="size-5 text-foreground" />
          <code className="text-step--2 text-muted">aria-hidden</code>
          <Icon name="cross" aria-label="Clear" className="size-5 text-foreground" />
          <code className="text-step--2 text-muted">role=&quot;img&quot;</code>
        </div>
      </Section>
    </div>
  ),
};

export const Playground: Story = {};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { Icon, iconGrids, iconNames } from "./icon";

/* Whole multiples of each icon's own grid, so every cell stays crisp: a 5 × 5
  glyph at 10, 15, 20 and 40px, a 6 × 6 one at 12, 18, 24 and 48px */
const multiples = [2, 3, 4, 8];

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
              <Icon name={name} className="text-foreground" style={{ width: iconGrids[name] * 8, height: iconGrids[name] * 8 }} />
              <code className="text-step--2 text-muted">{name}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section title="sizes">
        <div className="grid gap-s">
          {multiples.map((multiple) => (
            <div key={multiple} className="flex items-center gap-m">
              <code className="w-12 text-step--2 text-muted">{multiple}× grid</code>
              {iconNames.map((name) => (
                <Icon
                  key={name}
                  name={name}
                  className="text-accent"
                  style={{ width: iconGrids[name] * multiple, height: iconGrids[name] * multiple }}
                />
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

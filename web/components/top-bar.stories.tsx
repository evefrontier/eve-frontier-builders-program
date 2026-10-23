import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { navigation } from "@/app/navigation";
import { Section } from "@/stories/section";
import { TopBar } from "./top-bar";

const meta = {
  title: "Navigation/TopBar",
  component: TopBar,
  /* The site's own navigation, so the stories show what ships */
  args: navigation,
  argTypes: {
    search: { table: { disable: true } },
  },
  /* The bar spans the viewport; the current page lights Courses */
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/courses" } },
  },
} satisfies Meta<typeof TopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The bar fluid, then held at a few widths: Courses folds into More below
 * about 905px. Each copy is clipped so it sits still instead of sticking.
 */
export const All: Story = {
  /* Four copies of the bar repeat its Primary navigation and search landmarks; the site has one */
  parameters: { a11y: { config: { rules: [{ id: "landmark-unique", enabled: false }] } } },
  render: (args) => (
    <div className="grid gap-l py-s">
      <Section title="fluid">
        <div className="overflow-hidden">
          <TopBar {...args} />
        </div>
      </Section>
      {[960, 840, 768].map((width) => (
        <Section key={width} title={`${width}px`}>
          <div className="overflow-hidden" style={{ width }}>
            <TopBar {...args} />
          </div>
        </Section>
      ))}
    </div>
  ),
};

/**
 * Below the md breakpoint the bar keeps the brand and the dots, and the Sheet
 * carries the search, the tabs and the theme toggle. The `/` shortcut opens it
 * on the field. The canvas shows it at a phone width; the docs page cannot
 * narrow its frame, so open the story to see it.
 */
export const Narrow: Story = {
  globals: { viewport: { value: "mobile2" } },
  parameters: { docs: { story: { inline: false, height: "160px" } } },
};

export const Playground: Story = {};

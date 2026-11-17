import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Placeholder } from "@/components/placeholder";
import { course } from "@/stories/course";
import { Section } from "@/stories/section";
import { LessonView } from "./lesson-view";

/* A course of one module, where the lessons fit without scrolling */
const short = { ...course, title: "A first look at the World API", modules: course.modules.slice(1, 2) };

const meta = {
  title: "Components/LessonView",
  component: LessonView,
  args: {
    course,
    children: <Placeholder name="Lesson" height={720} note="The lesson's own content" />,
  },
  argTypes: {
    children: { table: { disable: true } },
  },
  /* The view fills the screen and reads the lesson from the route */
  parameters: {
    layout: "fullscreen",
    docs: { story: { inline: false, height: "640px" } },
    nextjs: {
      appDirectory: true,
      navigation: {
        segments: [
          ["course", course.slug],
          ["module", "graphql-against-the-frontier"],
          ["lesson", "asking-for-fields"],
        ],
      },
    },
  },
} satisfies Meta<typeof LessonView>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The lessons on the left open to the module on screen and mark its lesson.
 * The blocks in the bar fold either side pane, and the divider resizes the
 * workbench, which is a placeholder for now. Each copy is held at 560px.
 */
export const All: Story = {
  /* Two copies of the view repeat its landmarks; a page has one */
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "landmark-unique", enabled: false },
          { id: "landmark-no-duplicate-main", enabled: false },
        ],
      },
    },
  },
  render: (args) => (
    <div className="grid gap-l p-s">
      <Section title="a course of several modules">
        <div className="h-140 border border-line [&>div]:h-full">
          <LessonView {...args} />
        </div>
      </Section>
      <Section title="a course of one module">
        <div className="h-140 border border-line [&>div]:h-full">
          <LessonView {...args} course={short} />
        </div>
      </Section>
    </div>
  ),
};

/**
 * Below the lg breakpoint the side panes leave the page and a bar at the foot
 * opens each as a sheet over the lower part of the lesson. Escape, the same
 * button or a lesson link shuts it.
 */
export const Narrow: Story = {
  globals: { viewport: { value: "mobile2" } },
};

export const Playground: Story = {};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { Accordion, AccordionItem, AccordionLink } from "./accordion";

const modules = [
  {
    value: "before",
    title: "Before you query",
    lessons: [
      { label: "What an indexer is for", note: "6 min" },
      { label: "The shape of world state", note: "7 min" },
      { label: "Your first request", note: "5 min" },
    ],
  },
  {
    value: "graphql",
    title: "GraphQL against the Frontier",
    lessons: [
      { label: "Asking for fields", note: "9 min" },
      { label: "Filtering and paging", note: "8 min" },
      { label: "Reading a Smart Assembly, one field at a time" },
    ],
  },
  {
    value: "constraints",
    title: "Constraints every builder works inside",
    lessons: [{ label: "What the World API will not do", note: "14 min" }],
  },
];

/* The modules as numbered items of numbered links, `current` marking one lesson as the page on screen */
function items(current?: string) {
  return modules.map((entry, i) => (
    <AccordionItem key={entry.value} value={entry.value} number={String(i + 1).padStart(2, "0")} title={entry.title}>
      <ol role="list">
        {entry.lessons.map((lesson, j) => (
          <li key={lesson.label}>
            <AccordionLink href="#" number={`${i + 1}.${j + 1}`} note={lesson.note} current={lesson.label === current}>
              {lesson.label}
            </AccordionLink>
          </li>
        ))}
      </ol>
    </AccordionItem>
  ));
}

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  subcomponents: { AccordionItem, AccordionLink },
  args: { children: null },
  argTypes: {
    /* The open items are set once, on mount, so they make no working control */
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  /* As wide as the lesson view's contents pane */
  decorators: [(Story) => <div className="max-w-78"><Story /></div>],
  render: (args) => (
    <Accordion {...args} defaultValue={["graphql"]}>
      {items("Asking for fields")}
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * An item opens on a click, Enter or Space, and its list slides out from under
 * it; Tab moves from one item to the next. Any number can be open. An item's
 * number is optional; a row shows its number, or the lamp when it has none.
 * Notes and the current page are optional, and an item can hold any content.
 */
export const All: Story = {
  /* The sections repeat the same items, and each open panel is a region named by its title */
  parameters: { a11y: { config: { rules: [{ id: "landmark-unique", enabled: false }] } } },
  render: () => (
    <div className="grid gap-l">
      <Section title="numbered links, one current">
        <Accordion defaultValue={["graphql"]}>{items("Asking for fields")}</Accordion>
      </Section>
      <Section title="all closed">
        <Accordion>{items()}</Accordion>
      </Section>
      <Section title="several open">
        <Accordion defaultValue={["before", "constraints"]}>{items()}</Accordion>
      </Section>
      <Section title="no numbers, a lamp on each row">
        <Accordion defaultValue={["docs"]}>
          <AccordionItem value="docs" title="Documentation">
            <ul role="list">
              <li><AccordionLink href="#" current>World API reference</AccordionLink></li>
              <li><AccordionLink href="#">Starter repository</AccordionLink></li>
            </ul>
          </AccordionItem>
          <AccordionItem value="help" title="Help">
            <ul role="list">
              <li><AccordionLink href="#">Ask in Discord</AccordionLink></li>
            </ul>
          </AccordionItem>
        </Accordion>
      </Section>
      <Section title="any content">
        <Accordion defaultValue={["sheet"]}>
          <AccordionItem value="sheet" title="Course data sheet">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-4 py-3 text-step--2">
              <dt className="text-muted">Pillar</dt>
              <dd>2</dd>
              <dt className="text-muted">Lessons</dt>
              <dd>9</dd>
              <dt className="text-muted">Length</dt>
              <dd>80 min</dd>
            </dl>
          </AccordionItem>
        </Accordion>
      </Section>
    </div>
  ),
};

export const Playground: Story = {};

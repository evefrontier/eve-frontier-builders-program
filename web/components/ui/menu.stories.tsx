import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { LinkRow, Menu, MenuLink, MenuSeparator } from "./menu";
import { NavItem, NavList } from "./nav-item";

const meta = {
  title: "Navigation/Menu",
  component: Menu,
  subcomponents: { MenuLink, MenuSeparator, LinkRow },
  args: {
    label: "More",
    children: null,
  },
  argTypes: {
    label: { control: "text" },
    children: { table: { disable: true } },
  },
  /* The trigger is a NavItem, so every story sits in a NavList */
  render: (args) => (
    <NavList aria-label="Example">
      <NavItem href="#">Pathways</NavItem>
      <NavItem href="#">Courses</NavItem>
      <Menu {...args}>
        <MenuLink href="#docs">Documentation</MenuLink>
        <MenuLink href="#glossary" sub current>
          Glossary
        </MenuLink>
        <MenuSeparator />
        <MenuLink href="#about">About</MenuLink>
      </Menu>
    </NavList>
  ),
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The trigger in a row, and a fuller menu. Click the trigger or press Enter to open it; arrow keys move through links. */
export const All: Story = {
  render: (args) => (
    <div className="grid gap-l">
      <Section title="in a row">
        <NavList aria-label="In a row">
          <NavItem href="#">Pathways</NavItem>
          <Menu {...args}>
            <MenuLink href="#docs">Documentation</MenuLink>
            <MenuLink href="#about">About</MenuLink>
          </Menu>
        </NavList>
      </Section>
      <Section title="as the first item">
        <NavList aria-label="Menu first">
          <Menu {...args}>
            <MenuLink href="#docs">Documentation</MenuLink>
            <MenuLink href="#about">About</MenuLink>
          </Menu>
          <NavItem href="#">Pathways</NavItem>
        </NavList>
      </Section>
      <Section title="children, a separator, the current page and an external link">
        <NavList aria-label="Fuller menu">
          <NavItem href="#pathways">Pathways</NavItem>
          <Menu {...args}>
            <MenuLink href="#docs">Documentation</MenuLink>
            <MenuLink href="#glossary" sub current>
              Glossary
            </MenuLink>
            <MenuLink href="#reference" sub>
              Reference
            </MenuLink>
            <MenuSeparator />
            <MenuLink href="#about">About</MenuLink>
            <MenuLink href="https://docs.evefrontier.com/">Builder docs</MenuLink>
          </Menu>
        </NavList>
      </Section>
    </div>
  ),
};

export const Playground: Story = {};

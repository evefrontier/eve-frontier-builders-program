import type { TopBarProps } from "@/components/top-bar";

/** The site's navigation, shared by the root layout and the TopBar's stories. */
export const navigation = {
  brand: { label: "EF-B", href: "/" },
  tabs: [
    { label: "Pathways", href: "/pathways" },
    { label: "Courses", href: "/courses" },
  ],
  secondary: [
    { label: "Documentation", href: "https://docs.evefrontier.com/" },
    { label: "Glossary", href: "/glossary", sub: true },
    { label: "About", href: "/about" },
  ],
} satisfies TopBarProps;

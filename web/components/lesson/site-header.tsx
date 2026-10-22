import Link from "next/link";
import { NavItem, NavList } from "@/components/ui";

export const sections = ["courses", "pathways", "glossary"] as const;
export type Section = (typeof sections)[number];

const labels: Record<Section, string> = { courses: "Courses", pathways: "Pathways", glossary: "Glossary" };

/** The bar over every page outside the lesson player. */
export function SiteHeader({ current }: { current?: Section }) {
  return (
    <header className="sticky top-0 z-(--layer-sticky) border-b border-line bg-background">
      <div className="mx-auto flex min-h-(--bar-height) w-full max-w-[90rem] flex-wrap items-center justify-between gap-x-m gap-y-2xs px-s-l py-2xs">
        <Link href="/courses" className="font-heading text-step-0 font-bold">EVE Frontier Builders</Link>
        <NavList aria-label="Site" className="max-w-full overflow-x-auto [scrollbar-width:none]">
          {sections.map((section) => (
            <NavItem key={section} href={`/${section}`} current={section === current}>
              {labels[section]}
            </NavItem>
          ))}
        </NavList>
      </div>
    </header>
  );
}

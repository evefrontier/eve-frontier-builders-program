import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Courses" };

/* Sections from the Courses design, at their heights at 1200 */
export default function Courses() {
  return (
    <main className="grid gap-section pt-m pb-section">
      <h1 className="sr-only">Courses</h1>
      <Placeholder name="Hero" height={310} note="Full bleed · Title over a wide plate" />
      <div className="wrap">
        <Placeholder name="Rule" height={16} />
      </div>
      <div className="wrap grid items-start gap-s md:grid-cols-[293px_1fr]">
        <Placeholder
          as="aside"
          name="Filters"
          height={847}
          note="Pathway and Pillar · sticky beside the results, stacked above them on phones"
          className="md:sticky md:top-[calc(var(--bar-height)+var(--spacing-s))]"
        />
        <div className="grid gap-s">
          <Placeholder name="Toolbar" height={63} note="Count, sort and view" />
          <Placeholder name="Course grid" height={2214} note="Course cards, three across" />
          <Placeholder name="Load more" height={67} />
        </div>
      </div>
      <Placeholder name="Follow a pathway" height={390} note="Full bleed · Not sure where to start? Pathway cards" />
    </main>
  );
}

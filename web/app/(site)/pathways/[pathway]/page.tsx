import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { getPathways } from "@/lib/curriculum";

export const metadata: Metadata = { title: "Pathway" };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPathways().map((pathway) => ({ pathway }));
}

/* Sections from the Pathway page wireframe, at their heights at 1440 */
export default function Pathway() {
  return (
    <main className="grid gap-section pt-m pb-section">
      <h1 className="sr-only">Pathway</h1>
      <div className="wrap">
        <Placeholder name="Hero" height={420} note="Title, who it's for, summary, stats, Start">
          <Placeholder as="nav" name="Breadcrumbs" height={43} note="Pathways ▪ Builder" />
        </Placeholder>
      </div>
      <div className="wrap grid items-start gap-s md:grid-cols-[1fr_340px]">
        <div className="grid gap-section">
          <Placeholder name="What you'll learn" height={360} note="Outcomes as a two-column checklist" />
          <Placeholder name="Route" height={900} note="The courses in order on a spine, with pillar markers between steps" />
          <Placeholder name="Before you start" height={140} note="What to finish first, linked" />
        </div>
        <div className="grid gap-s md:sticky md:top-[calc(var(--bar-height)+var(--spacing-s))]">
          <Placeholder as="aside" name="Start card" height={320} note="Start or Continue, time left, what finishing earns" />
        </div>
      </div>
      <Placeholder name="Plateband" height={260} note="Full bleed · The pathway's word" />
      <div className="wrap">
        <Placeholder name="What you'll build" height={360} note="The projects you finish with, as build cards" />
      </div>
      <Placeholder name="Other pathways" height={360} note="Full bleed · The other two pathways, to switch route" />
      <Placeholder
        as="div"
        name="Pinned action bar"
        height={64}
        note="Phones only · Start or Continue, once the hero's button scrolls away"
        className="fixed inset-x-0 bottom-0 z-(--layer-sticky) bg-background md:hidden"
      />
    </main>
  );
}

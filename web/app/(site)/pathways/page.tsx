import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Pathways" };

/* Sections from the Pathways wireframe, at their heights at 1440: full-width bands for the three routes */
export default function Pathways() {
  return (
    <main className="grid gap-section pt-m pb-section">
      <h1 className="sr-only">Pathways</h1>
      <Placeholder name="Hero" height={310} note="Full bleed · Title over a wide plate, with a jump link to each pathway" />
      <Placeholder name="Pathway 01 · Non-developer" height={520} note="Full bleed · Art on the left; number, name, who it's for, stats, the pillars it draws on, Start" />
      <Placeholder name="Pathway 02 · Builder" height={520} note="Full bleed · The same band mirrored, art on the right" />
      <Placeholder name="Pathway 03 · Advanced" height={520} note="Full bleed · Art on the left; says what to finish first" />
      <div className="wrap grid gap-section">
        <Placeholder name="Compare the three" height={300} note="Who it's for, time, courses, what you build, what to know first" />
        <Placeholder name="Pillar spine" height={360} note="The five pillars, marked with which pathway uses which" />
      </div>
      <Placeholder name="CTA band" height={190} note="Full bleed · Not sure which fits? Start with Pillar 0" />
    </main>
  );
}

import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "About" };

/* Sections from the About wireframe, at their heights at 1440 */
export default function About() {
  return (
    <main className="grid gap-section pt-m pb-section">
      <h1 className="sr-only">About</h1>
      <Placeholder name="Hero" height={480} note="Full bleed · An always-on learning and activation path for building in EVE Frontier" />
      <div className="wrap grid items-start gap-s md:grid-cols-[1fr_460px]">
        <Placeholder name="What it is" height={420} note="Why the programme exists, who it's for, what you can do by the end" />
        <Placeholder name="Three parts" height={420} note="Learn, build, ship: Pathways, Courses, the dapp index" />
      </div>
      <Placeholder name="Stat strip" height={160} note="Full bleed · Builders, courses, dapps shipped, if the numbers are real" />
      <div className="wrap grid gap-section">
        <Placeholder name="How it works" height={420} note="From first lesson to a published dapp, in steps" />
        <Placeholder name="Who's behind it" height={360} note="Fenris Creations, the programme team and partners" />
      </div>
      <Placeholder name="Get involved" height={340} note="Full bleed · Discord, GitHub, and contributing to docs and courses" />
      <div className="wrap">
        <Placeholder name="Questions" height={420} note="Short questions that open in place" />
      </div>
      <Placeholder name="CTA band" height={190} note="Full bleed · Start learning → Pathways" />
    </main>
  );
}

import { Placeholder } from "@/components/placeholder";

/* Sections from the Home design, at their heights at 1200 */
const SECTIONS = [
  { name: "Hero", height: 609, note: "Headline, the two ways in, and the scene loop" },
  { name: "01 · The world", height: 697, note: "What is EVE Frontier" },
  { name: "Plateband", height: 260, note: "Full bleed · Assemblies", bleed: true },
  { name: "02 · Assemblies", height: 692, note: "What is there to build" },
  { name: "03 · Live query", height: 906, note: "Ask the world a question: the GraphQL runner" },
  { name: "04 · Routes", height: 851, note: "Pathways: three pathway cards" },
  { name: "05 · Start here", height: 716, note: "Pillar 0: a feature card and two mini cards" },
  { name: "06 · Modules", height: 490, note: "Popular modules" },
  { name: "07 · Voices", height: 452, note: "From the builders: quote cards" },
];

export default function Home() {
  return (
    <main className="grid gap-section-lg pt-m pb-section-lg">
      <h1 className="sr-only">EVE Frontier Builders</h1>
      {SECTIONS.map(({ bleed, ...section }) =>
        bleed ? (
          <Placeholder key={section.name} {...section} />
        ) : (
          <div key={section.name} className="wrap">
            <Placeholder {...section} />
          </div>
        ),
      )}
      <div className="wrap">
        <Placeholder as="div" name="Trim band" height={53} note="Revision mark and rule" />
      </div>
      <Placeholder name="CTA band" height={190} note="Full bleed · Start with the world. Ship something in it." />
    </main>
  );
}

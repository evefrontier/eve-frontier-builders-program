import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = { title: "Glossary" };

/* Sections from the Glossary wireframe, at their heights at 1440 */
export default function Glossary() {
  return (
    <main className="grid gap-section pt-m pb-section">
      <h1 className="sr-only">Glossary</h1>
      <div className="wrap">
        <Placeholder name="Hero" height={180} note="Title, one line, a term count, and a field that filters as you type">
          <Placeholder as="nav" name="Breadcrumbs" height={43} note="Documentation ▪ Glossary" />
        </Placeholder>
      </div>
      <div className="wrap sticky top-(--bar-height) z-1 bg-background">
        <Placeholder as="nav" name="Index bar" height={110} note="Pinned under the bar: A–Z letters and topic chips, showing n of N" />
      </div>
      <div className="wrap grid items-start gap-s md:grid-cols-[1fr_340px]">
        <div className="grid gap-section">
          <Placeholder
            name="Letter group · A"
            height={420}
            note="A big letter, then a row per term: term, topic tag, a one-to-three sentence definition, Article → when there is one"
          />
          <Placeholder name="Letter group · B" height={260} note="Same rows, repeating down to Z" />
        </div>
        <div className="grid gap-s md:sticky md:top-[calc(var(--bar-height)+110px+var(--spacing-s))]">
          <Placeholder as="aside" name="Most looked up" height={140} note="Five term chips" />
        </div>
      </div>
      <Placeholder name="CTA band" height={140} note="Full bleed · Missing a word? Suggest a term" />
    </main>
  );
}

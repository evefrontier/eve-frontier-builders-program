import type { Metadata } from "next";
import { Glossary } from "@/components/glossary/glossary";
import { Placeholder } from "@/components/placeholder";
import { getGlossary, glossaryTopics } from "@/lib/curriculum";

export const metadata: Metadata = { title: "Glossary" };

export default function GlossaryPage() {
  return (
    <main className="grid gap-section pt-m pb-section">
      <Glossary terms={getGlossary()} topics={glossaryTopics} />
      <Placeholder name="CTA band" height={140} note="Full bleed · Missing a word? Suggest a term" />
    </main>
  );
}

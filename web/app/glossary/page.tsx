import type { Metadata } from "next";
import { ContentPage } from "@/components/lesson/content-page";
import { GlossaryIndex } from "@/components/lesson/glossary-index";
import { getGlossary, getPage, topics } from "@/lib/content/load";

/** The heading and description come from glossary.md; the entries are drawn as the index. */
const head = () => {
  const { title, description } = getPage("glossary.md");
  return { title, description };
};

export function generateMetadata(): Metadata {
  return head();
}

export default function Glossary() {
  const terms = getGlossary();
  return (
    <ContentPage page={{ ...head(), root: { type: "root", children: [] } }} section="glossary">
      <p className="text-step--1 text-muted">{terms.length} {terms.length === 1 ? "word" : "words"} of the Frontier.</p>
      <GlossaryIndex terms={terms} topics={topics} />
    </ContentPage>
  );
}

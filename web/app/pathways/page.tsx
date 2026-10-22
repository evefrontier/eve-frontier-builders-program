import type { Metadata } from "next";
import Link from "next/link";
import { Plate } from "@/components/ui";
import { ContentPage, eyebrow } from "@/components/lesson/content-page";
import { PathwayFinder } from "@/components/lesson/pathway-finder";
import { getIndex, getPathways, getQuestions, renderMarkdown } from "@/lib/content/load";

export function generateMetadata(): Metadata {
  const { title, description } = getIndex().pathways;
  return { title, description };
}

export default function Pathways() {
  const { title, description, intro, finder } = getIndex().pathways;
  const pathways = getPathways();
  const questions = getQuestions();
  return (
    <ContentPage page={{ title, description, root: renderMarkdown(intro ?? "", "index.yaml") }} section="pathways">
      {finder && (
        <PathwayFinder
          title={finder.title}
          result={finder.result}
          none={finder.none}
          questions={finder.ask.map((id) => {
            if (!questions[id]) throw new Error(`curriculum/index.yaml: the finder asks "${id}", which isn't in questions.yaml`);
            return questions[id];
          })}
          pathways={pathways.map((p) => ({
            slug: p.slug, title: p.title, href: p.href, description: p.description, audience: p.audience, for: p.for,
            courses: p.courses.map((c) => c.title),
          }))}
        />
      )}
      <h2 className={`${eyebrow} mt-xl`}>All pathways</h2>
      <ul role="list" className="mt-xs grid gap-s sm:grid-cols-2">
        {pathways.map((pathway) => (
          <li key={pathway.slug} className="grid">
            <Plate as={Link} href={pathway.href} corners="tr" className="grid gap-2xs px-s py-s hover:[--plate-fill:var(--color-card-secondary)]">
              {pathway.audience && <span className={eyebrow}>{pathway.audience}</span>}
              <span className="text-step-1 font-bold">{pathway.title}</span>
              {pathway.description && <span className="text-step--1 text-muted">{pathway.description}</span>}
              <span className="text-step--2 text-muted">{pathway.courses.map((c) => c.title).join(" → ")}</span>
            </Plate>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}

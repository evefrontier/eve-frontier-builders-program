import type { Metadata } from "next";
import Link from "next/link";
import { Plate } from "@/components/ui";
import { ContentPage, eyebrow } from "@/components/lesson/content-page";
import { Tag } from "@/components/lesson/tag";
import { getArticles, getBacklinks, getPage, getTerms } from "@/lib/content/load";

export const dynamicParams = false;

/** Only terms with an article get a page; the rest live on the index. */
export function generateStaticParams() {
  return getArticles().map((term) => ({ term: term.slug }));
}

const find = (slug: string) => getArticles().find((term) => term.slug === slug)!;

export async function generateMetadata({ params }: PageProps<"/glossary/[term]">): Promise<Metadata> {
  const term = find((await params).term);
  return { title: term.title, description: term.definition };
}

export default async function Article({ params }: PageProps<"/glossary/[term]">) {
  const term = find((await params).term);
  const page = getPage(term.article!);
  const related = getTerms(page.root).filter((t) => t.slug !== term.slug);
  const taught = getBacklinks(term.slug);
  const articles = getArticles();
  const at = articles.indexOf(term);
  const [previous, next] = [articles[at - 1], articles[at + 1]];

  return (
    <ContentPage
      page={{ title: term.title, description: term.definition, root: page.root }}
      parent={{ title: "Glossary", href: "/glossary" }}
      section="glossary"
      meta={
        <div className="mt-xs grid gap-2xs">
          <p className="flex flex-wrap gap-2xs">{term.topics.map((topic) => <Tag key={topic}>{topic}</Tag>)}</p>
          {term.aliases.length > 0 && <p className="text-step--1 text-muted">Also called {term.aliases.join(", ")}</p>}
        </div>
      }
    >
      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-xl">
          <h2 id="related" className={eyebrow}>Related terms</h2>
          <ul role="list" className="mt-xs flex flex-wrap gap-2xs">
            {related.map((t) => (
              <li key={t.slug}>
                <Link href={t.href} className="inline-flex min-h-8 items-center border border-line px-xs text-step--1 font-bold hover:border-foreground">
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {taught.length > 0 && (
        <section aria-labelledby="taught" className="mt-xl">
          <h2 id="taught" className={eyebrow}>Where it&rsquo;s taught</h2>
          <ul role="list" className="mt-xs">
            {taught.map((lesson) => (
              <li key={lesson.file} className="border-b border-line">
                <Link href={lesson.href} className="flex items-center justify-between gap-s py-xs hover:text-accent-text">
                  <span className="font-bold">{lesson.title}</span>
                  <span className="text-step--2 text-muted">{lesson.duration} <span aria-hidden="true">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Other articles" className="mt-xl grid gap-xs sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        {previous ? (
          <Plate as={Link} href={previous.href} corners="tl" className="grid gap-3xs px-s py-xs hover:[--plate-fill:var(--color-card-secondary)]">
            <span className={eyebrow}>← Previous article</span>
            <b>{previous.title}</b>
          </Plate>
        ) : <span />}
        <Link href="/glossary" className="justify-self-center text-step--1 font-bold text-accent-text underline underline-offset-2">All terms</Link>
        {next ? (
          <Plate as={Link} href={next.href} corners="br" className="grid gap-3xs px-s py-xs text-right hover:[--plate-fill:var(--color-card-secondary)]">
            <span className={eyebrow}>Next article →</span>
            <b>{next.title}</b>
          </Plate>
        ) : <span />}
      </nav>
    </ContentPage>
  );
}

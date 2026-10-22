import type { ReactNode } from "react";
import Link from "next/link";
import type { Root } from "mdast";
import { getOutline } from "@/lib/content/load";
import { Markdown } from "./markdown";
import { SiteHeader, type Section } from "./site-header";

export const eyebrow = "font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase";

export interface ContentPageProps {
  page: { title: string; description?: string; root: Root };
  /** Shown under the description, such as a term's topics. */
  meta?: ReactNode;
  parent?: { title: string; href: string };
  section?: Section;
  children?: ReactNode;
}

/**
 * A page outside the lesson player: the Courses and Pathways pages, a
 * pathway, and the glossary and its articles. The page's own text comes first;
 * `children` adds what's generated for it, such as course cards.
 */
export function ContentPage({ page, meta, parent, section, children }: ContentPageProps) {
  const outline = getOutline(page.root);

  return (
    <>
      <SiteHeader current={section} />
      <div className="mx-auto grid w-full max-w-[90rem] gap-l px-s-l py-l min-[90rem]:grid-cols-[minmax(0,1fr)_13rem]">
        <main className="w-full max-w-[52rem]">
          {parent && (
            <p className={eyebrow}>
              <Link href={parent.href} className="hover:text-foreground">{parent.title}</Link>
            </p>
          )}
          <h1 className="mt-xs text-step-4">{page.title}</h1>
          {page.description && <p className="mt-s text-step-1 text-muted">{page.description}</p>}
          {meta}

          {page.root.children.length > 0 && (
            <div className="mt-l border-t border-line pt-l">
              <Markdown nodes={page.root.children} />
            </div>
          )}

          {children}
        </main>

        {outline.length > 1 && (
          <nav aria-label="On this page" className="hidden text-step--1 min-[90rem]:sticky min-[90rem]:top-[calc(var(--bar-height)+1rem)] min-[90rem]:block min-[90rem]:self-start">
            <h2 className={eyebrow}>On this page</h2>
            <ol className="mt-xs border-l border-line">
              {outline.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="flex gap-2xs py-1 pl-xs text-muted hover:text-foreground">
                    <span aria-hidden="true" className="font-heading">{String(i + 1).padStart(2, "0")}</span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </>
  );
}

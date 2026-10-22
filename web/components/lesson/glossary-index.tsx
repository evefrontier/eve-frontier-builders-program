"use client";

import { Fragment, useDeferredValue, useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Term } from "@/lib/content/load";
import { Tag } from "./tag";

const letters = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const letterOf = (term: Term) => (/^[a-z]/i.test(term.title) ? term.title[0].toUpperCase() : "#");
const letterId = (letter: string) => (letter === "#" ? "letter-symbols" : `letter-${letter.toLowerCase()}`);

/** Wraps each match of `query` in `<mark>`. */
function Marked({ text, query }: { text: string; query: string }) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    i % 2 ? <mark key={i} className="bg-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] text-inherit">{part}</mark> : <Fragment key={i}>{part}</Fragment>,
  );
}

/**
 * The glossary index: a filter over names, aliases and definitions, topic
 * chips that narrow it, and every term grouped by letter. A term with an
 * article links to it; every row can be linked to directly.
 */
export function GlossaryIndex({ terms, topics }: { terms: Term[]; topics: readonly string[] }) {
  const [query, setQuery] = useState("");
  const [on, setOn] = useState<ReadonlySet<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const q = useDeferredValue(query.trim().toLowerCase());

  const shown = terms.filter(
    (term) =>
      (!q || [term.title, term.definition, ...term.aliases].some((text) => text.toLowerCase().includes(q))) &&
      (!on.size || term.topics.some((topic) => on.has(topic))),
  );
  const present = new Set(shown.map(letterOf));
  const filtered = Boolean(q) || on.size > 0;

  const toggle = (topic: string) => {
    const next = new Set(on);
    if (next.has(topic)) next.delete(topic);
    else next.add(topic);
    setOn(next);
  };

  const copy = async (slug: string) => {
    await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied((current) => (current === slug ? null : current)), 2000);
  };

  return (
    <div className="mt-m">
      <Field
        type="search"
        placeholder="Filter by word or meaning"
        aria-label="Filter the glossary by word or meaning"
        shortcut="/"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="max-w-[36rem]"
      />

      <div className="sticky top-(--bar-height) z-(--layer-raised) mt-s border-y border-line bg-background py-xs">
        <nav aria-label="Jump to a letter">
          <ul role="list" className="flex flex-wrap gap-0.5 font-heading text-step--1">
            {letters.map((letter) => (
              <li key={letter}>
                {present.has(letter) ? (
                  <a href={`#${letterId(letter)}`} className="grid size-7 place-items-center text-accent-text hover:bg-card">
                    {letter}
                  </a>
                ) : (
                  <span aria-hidden="true" className="grid size-7 place-items-center text-muted opacity-50">{letter}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-2xs flex flex-wrap items-center gap-xs">
          <div role="group" aria-label="Show topics" className="flex flex-wrap gap-2xs">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                aria-pressed={on.has(topic)}
                onClick={() => toggle(topic)}
                className="min-h-8 border border-line px-xs text-step--2 font-bold text-muted hover:text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
              >
                {topic}
              </button>
            ))}
          </div>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOn(new Set());
              }}
              className="min-h-8 px-xs text-step--2 font-bold text-accent-text underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
          <p className="ml-auto text-step--2 text-muted">
            Showing <b className="text-foreground">{shown.length}</b> of {terms.length}
          </p>
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {filtered ? `${shown.length} of ${terms.length} terms shown` : ""}
      </p>

      {shown.length === 0 && <p className="mt-l text-muted">No word matches that. Clear the filters to see every term.</p>}

      {letters.filter((letter) => present.has(letter)).map((letter) => {
        const group = shown.filter((term) => letterOf(term) === letter);
        return (
          <section key={letter} id={letterId(letter)} aria-labelledby={`${letterId(letter)}-h`} className="mt-l scroll-mt-[calc(var(--bar-height)+8rem)]">
            <div className="flex items-end gap-s border-b-2 border-foreground pb-2xs">
              <h2 id={`${letterId(letter)}-h`} className="text-step-5 leading-none">
                <span className="sr-only">{letter === "#" ? "Symbols" : `Letter ${letter}`}</span>
                <span aria-hidden="true">{letter}</span>
              </h2>
              <span className="ml-auto text-step--2 text-muted">{group.length} {group.length === 1 ? "term" : "terms"}</span>
            </div>
            <ul role="list">
              {group.map((term) => (
                <li
                  key={term.slug}
                  id={term.slug}
                  className="group grid scroll-mt-[calc(var(--bar-height)+8rem)] gap-x-m gap-y-2xs border-b border-line px-2xs py-s target:bg-tint-background target:shadow-[inset_3px_0_0_var(--color-accent)] sm:grid-cols-[minmax(0,14rem)_1fr]"
                >
                  <p className="flex items-start gap-2xs">
                    {term.article ? (
                      <Link href={term.href} className="font-bold text-accent-text underline underline-offset-2 hover:decoration-2">
                        <Marked text={term.title} query={q} />
                        <span aria-hidden="true"> →</span>
                        <span className="sr-only"> (read the article)</span>
                      </Link>
                    ) : (
                      <b><Marked text={term.title} query={q} /></b>
                    )}
                    <button
                      type="button"
                      onClick={() => copy(term.slug)}
                      aria-label={`Copy link to ${term.title}`}
                      className={cn(
                        "min-h-6 px-1 text-step--2 text-muted hover:text-foreground focus-visible:opacity-100",
                        copied === term.slug ? "opacity-100" : "opacity-0 group-hover:opacity-100 max-[48rem]:opacity-100",
                      )}
                    >
                      {copied === term.slug ? "Link copied" : "#"}
                    </button>
                  </p>
                  <div className="text-step--1">
                    <p className="max-w-[68ch] text-muted"><Marked text={term.definition} query={q} /></p>
                    {term.aliases.length > 0 && (
                      <p className="mt-3xs text-step--2 text-muted">Also: <Marked text={term.aliases.join(", ")} query={q} /></p>
                    )}
                    <p className="mt-2xs flex flex-wrap gap-2xs">
                      {term.topics.map((topic) => <Tag key={topic}>{topic}</Tag>)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

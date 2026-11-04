"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { Placeholder } from "@/components/placeholder";
import { Button, Field, Icon, Plate, Tag } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { GlossaryTerm, GlossaryTopic } from "@/lib/curriculum";
import { EXTERNAL } from "@/lib/external";
import { fold } from "@/lib/search";
import navStyles from "@/components/ui/nav-item.module.css";
import styles from "./glossary.module.css";

const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

const groupId = (letter: string) => (letter === "#" ? "letter-symbols" : `letter-${letter.toLowerCase()}`);
const letterName = (letter: string) => (letter === "#" ? "Symbols" : letter);
const count = (n: number) => `${n} ${n === 1 ? "term" : "terms"}`;

/* Anchors, and links that take focus, clear the top bar and the index bar pinned under it. The index
  bar's height is measured once the page runs; before that, its usual height. */
/* The filter the page was opened with, from ?q=. The address is only known in
  the browser, so the prerendered page starts unfiltered. */
const noChanges = () => () => {};
const addressQuery = () => new URLSearchParams(location.search).get("q") ?? "";
const noQuery = () => "";

/* The address keeps the filter, so a filtered list can be shared or reloaded */
function keepInAddress(query: string) {
  const url = new URL(location.href);
  if (query.trim()) url.searchParams.set("q", query.trim());
  else url.searchParams.delete("q");
  history.replaceState(history.state, "", url);
}

/* The index bar's topic toggles */
const chip = "inline-flex min-h-7 cursor-pointer items-center gap-2 py-1 pr-3 pl-2.5 text-step--2 font-bold whitespace-nowrap text-foreground";

const clearBars = "scroll-mt-[calc(var(--bar-height)+var(--index-bar-height,7rem)+var(--spacing-xs))]";

/** `text` with every place a query word falls in it marked. */
function Marked({ text, words }: { text: string; words: string[] }) {
  const folded = fold(text);
  // Folding keeps the length for the site's text; if it ever doesn't, show it unmarked
  if (words.length === 0 || folded.length !== text.length) return text;

  const marked = new Array<boolean>(text.length).fill(false);
  for (const word of words) {
    for (let at = folded.indexOf(word); at > -1; at = folded.indexOf(word, at + word.length)) {
      marked.fill(true, at, at + word.length);
    }
  }

  const parts: ReactNode[] = [];
  for (let start = 0; start < text.length; ) {
    let end = start;
    while (end < text.length && marked[end] === marked[start]) end++;
    const slice = text.slice(start, end);
    parts.push(
      marked[start] ? (
        <mark key={start} className="bg-[color-mix(in_srgb,var(--color-accent)_28%,transparent)] text-current">
          {slice}
        </mark>
      ) : (
        slice
      ),
    );
    start = end;
  }
  return parts;
}

/**
 * The glossary's A–Z index: a field that filters as you type, an index bar
 * pinned under the top bar with the letters, topic toggles and a count, and a
 * letter group of rows below. The filter is kept in the address as `?q=`, so a
 * filtered list can be shared, and every row is an anchor of its own.
 */
export function Glossary({ terms, topics }: { terms: GlossaryTerm[]; topics: readonly GlossaryTopic[] }) {
  const opened = useSyncExternalStore(noChanges, addressQuery, noQuery);
  const [typed, setQuery] = useState<string | null>(null);
  const query = typed ?? opened;
  const [on, setOn] = useState<GlossaryTopic[]>([]);
  const [here, setHere] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [live, setLive] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef(0);

  const haystacks = useMemo(() => terms.map((term) => fold([term.title, ...term.aliases, term.definition].join(" "))), [terms]);
  const words = useMemo(() => fold(query).split(/\s+/).filter(Boolean), [query]);
  const shown = useMemo(
    () =>
      new Set(
        terms
          .filter((term, i) => words.every((word) => haystacks[i].includes(word)))
          .filter((term) => on.length === 0 || term.topics.some((topic) => on.includes(topic)))
          .map((term) => term.slug),
      ),
    [terms, haystacks, words, on],
  );
  const groups = useMemo(
    () =>
      LETTERS.flatMap((letter) => {
        const of = terms.filter((term) => term.letter === letter);
        return of.length ? [{ letter, terms: of, shown: of.filter((term) => shown.has(term.slug)).length }] : [];
      }),
    [terms, shown],
  );
  const filtered = query.trim() !== "" || on.length > 0;

  const filter = (value: string) => {
    setQuery(value);
    keepInAddress(value);
  };

  const clear = () => {
    filter("");
    setOn([]);
    fieldRef.current?.focus();
  };

  const toggle = (topic: GlossaryTopic) =>
    setOn((current) => (current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic]));

  // An address that points at a row the filters hide shows it
  useEffect(() => {
    const reveal = () => {
      const row = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (row?.hidden) {
        setQuery("");
        setOn([]);
        keepInAddress("");
      }
    };
    addEventListener("hashchange", reveal);
    return () => removeEventListener("hashchange", reveal);
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const measure = () => rootRef.current?.style.setProperty("--index-bar-height", `${bar.offsetHeight}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // The letter you are reading is lit in the index bar
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = (barRef.current?.getBoundingClientRect().bottom ?? 0) + 24;
      let current: string | null = null;
      for (const group of listRef.current?.querySelectorAll<HTMLElement>("section[data-letter]:not([hidden])") ?? []) {
        if (group.getBoundingClientRect().top > line) break;
        current = group.dataset.letter ?? null;
      }
      setHere(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [shown]);

  // On a phone the letters scroll sideways: keep the lit one in view
  useEffect(() => {
    const letters = lettersRef.current;
    const lit = letters?.querySelector<HTMLElement>("[aria-current]");
    if (!letters || !lit || letters.scrollWidth <= letters.clientWidth) return;
    const pad = 40;
    const left = lit.offsetLeft;
    const right = left + lit.offsetWidth;
    if (left < letters.scrollLeft + pad) letters.scrollLeft = left - pad;
    else if (right > letters.scrollLeft + letters.clientWidth - pad) letters.scrollLeft = right - letters.clientWidth + pad;
  }, [here]);

  // Announced when the filters change, once typing settles, not on every key or on load
  const filters = `${words.join(" ")}|${on.join(",")}`;
  const announcedFor = useRef(filters);
  useEffect(() => {
    if (filters === announcedFor.current) return;
    announcedFor.current = filters;
    const timer = setTimeout(() => setLive(shown.size ? `Showing ${shown.size} of ${terms.length} terms` : "No terms match"), 450);
    return () => clearTimeout(timer);
  }, [filters, shown, terms.length]);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  // Enter goes to the first match rather than submitting the form
  const jump = (event: FormEvent) => {
    event.preventDefault();
    const first = terms.find((term) => shown.has(term.slug));
    const row = first && document.getElementById(first.slug);
    if (!row) return;
    row.focus({ preventScroll: true });
    row.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  // Copies the row's address; with no clipboard the link still works as a link
  const copy = async (event: MouseEvent<HTMLAnchorElement>, term: GlossaryTerm) => {
    if (!navigator.clipboard) return;
    event.preventDefault();
    const url = new URL(`#${term.slug}`, location.href);
    url.search = "";
    try {
      await navigator.clipboard.writeText(url.href);
    } catch {
      location.assign(`#${term.slug}`);
      return;
    }
    history.replaceState(history.state, "", url.hash);
    setCopied(term.slug);
    setLive(`Link to ${term.title} copied`);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(null), 1600);
  };

  const noneTitle = query.trim()
    ? `No word matches “${query.trim()}”${on.length ? ` in ${on.join(", ")}` : ""}`
    : `No words in ${on.join(", ")}`;

  return (
    <div ref={rootRef} className="contents">
      <div className="wrap grid gap-s">
        <Placeholder as="nav" name="Breadcrumbs" height={43} note="Documentation ▪ Glossary" />
        <h1>Glossary</h1>
        <p className="max-w-[52ch]">
          {terms.length} words of the Frontier, from {terms[0]?.title} to {terms.at(-1)?.title}.
        </p>
        <form role="search" aria-label="Glossary" onSubmit={jump} className="max-w-[460px]">
          <Field
            ref={fieldRef}
            value={query}
            onChange={(event) => filter(event.target.value)}
            placeholder="Filter by word or meaning"
            aria-label="Filter the glossary by word or meaning"
            aria-controls="glossary-terms"
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>

      <div ref={barRef} className="sticky top-(--bar-height) z-(--layer-raised) border-b border-line bg-background bg-grain">
        <div className="wrap grid gap-2xs py-2xs">
          {/* A scrolling row clips what sticks out of it, so 2px of padding, cancelled by the
            margin, leaves room for the current letter's outline in forced colours */}
          <nav
            ref={lettersRef}
            aria-label="Jump to a letter"
            className="relative -m-0.5 flex gap-0.5 overflow-x-auto p-0.5 [scrollbar-width:none]"
          >
            {LETTERS.map((letter) => {
              const n = groups.find((group) => group.letter === letter)?.shown ?? 0;
              const cell = "grid h-8 min-w-[30px] flex-none place-items-center px-1 font-heading text-step--1 leading-none";
              return n ? (
                <a
                  key={letter}
                  href={`#${groupId(letter)}`}
                  aria-label={`${letterName(letter)}, ${count(n)}`}
                  aria-current={here === letter || undefined}
                  className={cn(
                    cell,
                    "relative text-foreground hover:bg-card",
                    styles.letter,
                    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground",
                    "aria-[current=true]:bg-foreground aria-[current=true]:text-background forced-colors:aria-[current=true]:outline-2 forced-colors:aria-[current=true]:outline-[Highlight]",
                  )}
                >
                  {letter}
                </a>
              ) : (
                <span key={letter} className={cn(cell, "text-muted opacity-45")}>
                  <span aria-hidden="true">{letter}</span>
                  <span className="sr-only">{letterName(letter)}: no terms</span>
                </span>
              );
            })}
          </nav>
          <div className="flex min-w-0 items-center gap-x-s gap-y-2xs">
            <div role="group" aria-label="Show topics" className="flex min-w-0 flex-wrap gap-1.5">
              {topics.map((topic) => (
                <Plate as="span" key={topic} className={cn("-m-1 inline-flex flex-none p-1", styles.ring)}>
                  <Plate
                    as="button"
                    type="button"
                    aria-pressed={on.includes(topic)}
                    onClick={() => toggle(topic)}
                    className={cn(chip, "aria-pressed:text-background", styles.chip)}
                  >
                    <span aria-hidden="true" className={cn(navStyles.lamp, styles.lamp, "size-[5px]")} />
                    {topic}
                  </Plate>
                </Plate>
              ))}
              {filtered && (
                <Button variant="secondary" size="xs" onClick={clear}>
                  <span className="inline-flex items-center gap-2">
                    <Icon name="cross" className="size-2.5 text-accent-text" />
                    Clear filters
                  </span>
                </Button>
              )}
            </div>
            {/* A phone shows "30 / 42", which a screen reader would read as "30 slash 42" */}
            <p className="ml-auto flex-none text-step--2 whitespace-nowrap text-muted">
              <span className="sr-only">
                Showing {shown.size} of {terms.length} terms
              </span>
              <span aria-hidden="true">
                <span className="max-md:hidden">Showing </span>
                <b className="font-heading text-step-0 text-foreground tabular-nums">{shown.size}</b>
                <span className="max-md:hidden"> of </span>
                <span className="md:hidden"> / </span>
                {terms.length}
              </span>
            </p>
          </div>
        </div>
      </div>
      <p role="status" className="sr-only">
        {live}
      </p>

      <div className="wrap grid items-start gap-s lg:grid-cols-[minmax(0,1fr)_340px]">
        <div ref={listRef} id="glossary-terms">
          {groups.map((group) => {
            const id = groupId(group.letter);
            return (
              <section
                key={group.letter}
                id={id}
                data-letter={group.letter}
                hidden={!group.shown}
                className={cn("mb-l", clearBars)}
              >
                <div className="flex items-end gap-s border-b-2 border-foreground pb-2xs">
                  <h2 className="text-step-5 leading-none">
                    <span className="sr-only">{group.letter === "#" ? "Symbols" : `Letter ${group.letter}`}</span>
                    <span aria-hidden="true">{group.letter}</span>
                  </h2>
                  <span aria-hidden="true" className="mb-1 size-2.5 flex-none bg-accent" />
                  <span className="ml-auto pb-0.5 text-step--2 font-bold tracking-[0.08em] text-muted uppercase">{count(group.shown)}</span>
                </div>
                <ul role="list">
                  {group.terms.map((term) => (
                    <li
                      key={term.slug}
                      id={term.slug}
                      hidden={!shown.has(term.slug)}
                      tabIndex={-1}
                      className={cn(
                        "group/row grid gap-2xs border-b border-line px-xs py-s hover:bg-card md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-x-m",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground",
                        "target:bg-[color-mix(in_srgb,var(--color-accent)_9%,transparent)] target:shadow-[inset_3px_0_0_var(--color-accent)]",
                        "forced-colors:target:outline-2 forced-colors:target:outline-[Highlight]",
                        clearBars,
                      )}
                    >
                      <p className="flex items-center gap-1 self-start">
                        <b className="text-step--1 [overflow-wrap:anywhere] group-target/row:text-accent-text">
                          <Marked text={term.title} words={words} />
                        </b>
                        <a
                          href={`#${term.slug}`}
                          aria-label={`Copy link to ${term.title}`}
                          onClick={(event) => copy(event, term)}
                          className={cn(
                            "relative -my-1 grid size-6 flex-none place-items-center text-muted hover:text-foreground motion-safe:transition-opacity",
                            "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 group-target/row:opacity-100 pointer-coarse:opacity-60",
                            "focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-foreground",
                            copied === term.slug && "text-accent-text opacity-100",
                            clearBars,
                          )}
                        >
                          <Icon name="link" className="size-3" />
                          {copied === term.slug && (
                            <span
                              aria-hidden="true"
                              className="absolute top-1/2 left-full ml-1.5 -translate-y-1/2 bg-foreground px-1.5 py-0.5 text-step--2 leading-none font-bold whitespace-nowrap text-background"
                            >
                              Link copied
                            </span>
                          )}
                        </a>
                      </p>
                      <div className="grid min-w-0 justify-items-start gap-2xs">
                        <p className="max-w-[68ch] text-step--1 text-muted">
                          <Marked text={term.definition} words={words} />
                        </p>
                        {term.docs && (
                          // The definition's taller line adds space above the link that the tags' boxes don't
                          // add below, and the underline sits in the gap, so mb-2.5 evens the two out
                          <a
                            href={term.docs.url}
                            {...EXTERNAL}
                            className={cn(
                              "mb-2.5 inline-flex items-center gap-1 text-step--2 font-bold text-muted underline underline-offset-2 hover:text-foreground hover:decoration-2",
                              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                              clearBars,
                            )}
                          >
                            {term.docs.label}
                            <Icon name="external" className="size-2.5" />
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2xs">
                          <p className="flex flex-wrap gap-x-1.5 gap-y-1">
                            {term.topics.map((topic) => (
                              <Tag key={topic}>{topic}</Tag>
                            ))}
                          </p>
                          {term.aliases.length > 0 && (
                            <p className="text-step--2 text-muted">
                              Also:{" "}
                              <span className="text-foreground">
                                <Marked text={term.aliases.join(", ")} words={words} />
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {shown.size === 0 && (
            <Plate corners="tl-br" cut="md" className="grid justify-items-start gap-xs p-m">
              <h2 className="text-step-1 [overflow-wrap:anywhere]">{noneTitle}</h2>
              <p className="max-w-[54ch] text-step--1 text-muted">It may be a word the glossary is still missing.</p>
              <Button variant="secondary" size="sm" onClick={clear}>
                Clear filters
              </Button>
            </Plate>
          )}
        </div>

        <div className="grid gap-s lg:sticky lg:top-[calc(var(--bar-height)+var(--index-bar-height,7rem)+var(--spacing-s))]">
          <Placeholder as="aside" name="Most looked up" height={140} note="Five term chips" />
        </div>
      </div>
    </div>
  );
}

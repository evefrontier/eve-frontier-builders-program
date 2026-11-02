"use client";

import { Fragment, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import Form from "next/form";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { claimsShortcut, Field, Icon, LinkRow, Menu, MenuLink, MenuSeparator, NavItem, NavList, Sheet, ThemeToggle } from "@/components/ui";
import { NavItemControl } from "@/components/ui/nav-item";
import { cn } from "@/lib/cn";

export type TopBarLink = { label: string; href: string };

export type TopBarProps = {
  brand: TopBarLink;
  tabs: TopBarLink[];
  /** Links that always live in More, and in the Sheet; `sub` indents one under the link before. */
  secondary?: (TopBarLink & { sub?: boolean })[];
  search?: { action: string; name?: string };
};

const SEARCH = "Search";
const SEARCH_ROUTE = { action: "/search" };

/**
 * The site's top bar: the brand, the tabs, the search field and the theme
 * toggle. Tabs that don't fit fold into More in order, measured against an
 * inert copy of the row. Below the md breakpoint the bar keeps the brand and
 * the Sheet's trigger, and the Sheet carries the rest.
 *
 * @example
 * ```tsx
 * <TopBar
 *   brand={{ label: "EF-B", href: "/" }}
 *   tabs={[{ label: "Pathways", href: "/pathways" }, { label: "Courses", href: "/courses" }]}
 *   secondary={[{ label: "About", href: "/about" }]}
 * />
 * ```
 */
export function TopBar({ brand, tabs, secondary = [], search = SEARCH_ROUTE }: TopBarProps) {
  const pathname = usePathname();

  const [visible, setVisible] = useState(tabs.length);
  const deckRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);

  const hasSecondary = secondary.length > 0;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [focusField, setFocusField] = useState(false);
  const sheetFieldRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useLayoutEffect(() => {
    const deck = deckRef.current;
    const measure = measureRef.current;
    const form = formRef.current;
    if (!deck || !measure || !form) return;

    // The deck's md: utilities decide wide or narrow, so its width is the
    // signal: nothing to measure while it is hidden, and once it shows the
    // Sheet's trigger is gone, so an open Sheet would have no way back
    const fit = () => {
      if (deck.clientWidth === 0) return;
      setSheetOpen(false);
      setFocusField(false);

      const slots = [...measure.querySelectorAll(":scope > ul > li")];
      const more = slots.pop();
      if (!more) return;

      const start = measure.getBoundingClientRect().left;
      const moreWidth = more.getBoundingClientRect().width;
      // The seam: how far a notched item, or the field, tucks under the one before
      const seam = -parseFloat(getComputedStyle(more).marginLeft);
      const room = deck.clientWidth - parseFloat(getComputedStyle(form).minWidth) + seam;

      let count = 0;
      slots.forEach((slot, i) => {
        const end = slot.getBoundingClientRect().right - start;
        const withMore = i < slots.length - 1 || hasSecondary;
        if ((withMore ? end - seam + moreWidth : end) <= room) count = i + 1;
      });
      setVisible(count);
    };

    const observer = new ResizeObserver(fit);
    observer.observe(deck);
    // The copy's width changes as fonts load and labels change
    observer.observe(measure);
    return () => observer.disconnect();
  }, [hasSecondary]);


  const setSheet = (open: boolean) => {
    setSheetOpen(open);
    if (!open) setFocusField(false);
  };

  // While the bar's field shows it claims / itself; while it is hidden, / opens
  // the Sheet on its field
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!claimsShortcut(event, "/") || fieldRef.current?.offsetParent !== null) return;
      event.preventDefault();
      if (sheetFieldRef.current) {
        sheetFieldRef.current.focus();
      } else {
        setFocusField(true);
        setSheetOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // The bar's field follows the searched query, unless someone is typing in it
  useEffect(() => {
    const field = fieldRef.current;
    if (field && document.activeElement !== field) field.value = query;
  }, [query]);

  const shown = tabs.slice(0, visible);
  const hidden = tabs.slice(visible);
  const hasMore = hidden.length > 0 || hasSecondary;
  const isCurrent = (href: string) => onPath(pathname, href);
  const name = search.name ?? "q";

  return (
    // A size container, so the brand and the bar's height scale with the bar rather than the window
    <header className="@container sticky top-0 z-(--layer-sticky) border-b border-line bg-background bg-grain">
      <Suspense fallback={null}>
        <SearchQuery name={name} active={samePath(pathname, search.action)} onQuery={setQuery} />
      </Suspense>
      <div className="wrap flex min-h-(--bar-height) items-center gap-s">
        <Brand {...brand} />

        <div ref={deckRef} className="relative hidden min-w-0 flex-1 items-center md:flex">
          <NavList aria-label="Primary" className="flex-none">
            {shown.map((tab) => (
              <NavItem key={tab.href} href={tab.href} current={isCurrent(tab.href)}>
                {tab.label}
              </NavItem>
            ))}
            {hasMore && (
              <Menu label="More">
                {hidden.map((tab) => (
                  <MenuLink key={tab.href} href={tab.href} current={isCurrent(tab.href)}>
                    {tab.label}
                  </MenuLink>
                ))}
                {hidden.length > 0 && hasSecondary && <MenuSeparator />}
                {secondary.map((link, i) => (
                  <Fragment key={link.href}>
                    {startsGroup(secondary, i) && <MenuSeparator />}
                    <MenuLink href={link.href} sub={link.sub} current={isCurrent(link.href)}>
                      {link.label}
                    </MenuLink>
                  </Fragment>
                ))}
              </Menu>
            )}
          </NavList>

          {/* Every tab and More, laid out but never seen, to measure what fits. Clipped on its
              own, so the copy can't widen the page while the row's focus rings stay unclipped. */}
          <div className="invisible absolute inset-0 overflow-hidden" aria-hidden="true" inert>
            <NavList ref={measureRef} className="absolute top-0 left-0">
              {tabs.map((tab) => (
                <NavItem key={tab.href} as="button">
                  {tab.label}
                </NavItem>
              ))}
              <NavItem as="button" indicator={<Icon name="caret" className="size-2.5" />}>
                More
              </NavItem>
            </NavList>
          </div>

          <Form ref={formRef} action={search.action} role="search" className="flex min-w-50 flex-1">
            <Field
              ref={fieldRef}
              interlock
              name={name}
              placeholder={SEARCH}
              aria-label={SEARCH}
              shortcut="/"
              className="flex-1"
            />
          </Form>
        </div>

        <ThemeToggle className="hidden md:grid" />

        <div className="ml-auto md:hidden">
          <Sheet
            label="Menu"
            header={<Brand {...brand} />}
            open={sheetOpen}
            onOpenChange={setSheet}
            initialFocus={focusField ? sheetFieldRef : undefined}
          >
            {/* The Sheet spaces its sections by --spacing-s; the field and the tabs stack closer */}
            <div className="grid gap-2xs">
              <Form action={search.action} role="search" onSubmit={() => setSheet(false)}>
                <Field ref={sheetFieldRef} name={name} defaultValue={query} placeholder={SEARCH} aria-label={SEARCH} />
              </Form>
              <nav aria-label="Primary">
                <ul role="list" className="grid gap-2xs">
                  {tabs.map((tab) => (
                    <li key={tab.href}>
                      <NavItemControl href={tab.href} current={isCurrent(tab.href)} className="flex">
                        {tab.label}
                      </NavItemControl>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            {/* As in More: rows as siblings, so a branch runs from a parent to its children,
                and a rule around each group. The list's own borders are the rules either side.
                The rows carry the Sheet's space above and below their text, so a rule sits one
                space from the text and rows sit two apart. */}
            {hasSecondary && (
              <nav aria-label="Secondary" className="grid border-y border-line">
                {secondary.map((link, i) => (
                  <Fragment key={link.href}>
                    {startsGroup(secondary, i) && <hr className="border-line" />}
                    <LinkRow
                      href={link.href}
                      sub={link.sub}
                      current={isCurrent(link.href)}
                      className="py-s text-muted hover:text-foreground focus-visible:text-foreground aria-[current]:text-foreground"
                    >
                      {link.label}
                    </LinkRow>
                  </Fragment>
                ))}
              </nav>
            )}
            {!hasSecondary && <hr className="border-line" />}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Brand({ label, href }: TopBarLink) {
  return (
    <Link
      href={href}
      className={cn(
        "flex-none font-heading text-brand font-bold tracking-[0.02em] text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground",
      )}
    >
      {label}
    </Link>
  );
}

/* A parent and its children form a group, divided from the links on either side */
function startsGroup(links: { sub?: boolean }[], i: number) {
  return i > 0 && !links[i].sub && Boolean(links[i - 1].sub || links[i + 1]?.sub);
}

/* The query in the URL while on the search page, so the fields show what was searched. In its
   own Suspense: reading search params client-renders up to the nearest boundary, and this way
   that's only this empty component, not the bar */
function SearchQuery({ name, active, onQuery }: { name: string; active: boolean; onQuery: (query: string) => void }) {
  const value = useSearchParams().get(name) ?? "";
  const query = active ? value : "";

  useEffect(() => onQuery(query), [query, onQuery]);

  return null;
}

const trimPath = (path: string) => path.replace(/\/+$/, "") || "/";

const samePath = (a: string, b: string) => trimPath(a) === trimPath(b);

/* A tab is current on its page and the pages under it, with trailing slashes ignored */
function onPath(pathname: string, href: string) {
  const path = trimPath(pathname);
  const target = trimPath(href);
  return path === target || (target !== "/" && path.startsWith(`${target}/`));
}

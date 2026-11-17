"use client";

import { Fragment, type ComponentPropsWithRef, type ReactNode } from "react";
import Link from "next/link";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { Icon } from "./icon";
import { Plate } from "./plate";
import navStyles from "./nav-item.module.css";
import { cn } from "@/lib/cn";
import styles from "./accordion.module.css";

export type AccordionProps = {
  /** The open items, by `value`. Controls the accordion; leave unset to let it manage itself. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
  children: ReactNode;
};

/**
 * A stack of items that each open to their content, any number at once. An
 * item is the Select's field and its content the Select's list, which slides
 * out from under the field. The browser's find-in-page reaches closed items.
 *
 * @example
 * ```tsx
 * <Accordion defaultValue={["first"]}>
 *   <AccordionItem value="first" number="01" title="Before you query">
 *     <ul role="list">
 *       <li><AccordionLink href="/lesson" number="1.1" note="6 min" current>What an indexer is for</AccordionLink></li>
 *     </ul>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export function Accordion({ value, defaultValue, onValueChange, className, children }: AccordionProps) {
  return (
    <BaseAccordion.Root
      multiple
      hiddenUntilFound
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      // Fixed spacing and leading keep every plate on whole pixels, where a fluid step would blur its 1px keylines
      className={cn("grid gap-3", className)}
    >
      {children}
    </BaseAccordion.Root>
  );
}

export type AccordionItemProps = {
  /** Its name in the accordion's `value` */
  value: string;
  title: string;
  /** Its place, shown before the title */
  number?: string;
  children: ReactNode;
};

/** One item of an `Accordion`: a heading that opens to its content. */
export function AccordionItem({ value, title, number, children }: AccordionItemProps) {
  return (
    // The focus ring sits outside the clipped field, as on the Select
    <BaseAccordion.Item value={value} render={<Plate corners="tr" cut="sm" />} className={cn("-m-1 grid p-1", styles.item)}>
      <BaseAccordion.Header className="text-step--2 leading-4">
        <BaseAccordion.Trigger
          render={<Plate as="button" corners="tr" cut="sm" />}
          className={cn(
            "group flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 py-2 text-left outline-none select-none",
            styles.trigger,
          )}
        >
          {number && (
            <span className="text-step--1 leading-4 text-muted tabular-nums group-data-panel-open:text-accent-text" aria-hidden="true">
              <Place number={number} />
            </span>
          )}
          <span className="min-w-0 flex-1">{title}</span>
          <Icon
            name="caret"
            className={cn(
              "size-2.5 flex-none text-muted transition-[rotate] duration-200 motion-reduce:transition-none",
              "group-hover:text-accent group-focus-visible:text-accent group-data-panel-open:rotate-180 group-data-panel-open:text-accent",
            )}
          />
          <span className={cn("absolute inset-x-px bottom-0 h-0.5 w-auto", navStyles.lamp, styles.rail)} aria-hidden="true" />
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
      <BaseAccordion.Panel className={styles.panel}>
        <Plate corners="bl" cut="sm" className={cn("px-px pb-px", styles.list)}>
          {children}
        </Plate>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}

/* A number such as 1.2. A point takes a whole cell in the heading face, so it is drawn in closer to its digits. */
function Place({ number }: { number: string }) {
  return number.split(".").map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <span className="-mx-[0.18em]">.</span>}
      {part}
    </Fragment>
  ));
}

export type AccordionLinkProps = {
  href: string;
  /** Its place, shown before the label in place of the lamp */
  number?: string;
  /** A short note at the end of the row, such as a length */
  note?: string;
  /** Marks the row as the page on screen */
  current?: boolean;
} & Omit<ComponentPropsWithRef<"a">, "href">;

/** A link row for an `AccordionItem`, as the Select draws its options. Put the rows in a list. */
export function AccordionLink({ href, number, note, current = false, className, children, ...rest }: AccordionLinkProps) {
  return (
    <Plate
      as={Link}
      href={href}
      {...rest}
      aria-current={current ? "page" : undefined}
      corners="bl"
      cut="sm"
      className={cn(
        "group/row flex min-h-10 items-center gap-3 py-2 pr-5 pl-4 text-step--2 leading-4 font-bold tracking-[0.06em] uppercase",
        styles.row,
        className,
      )}
    >
      {/* One mark a row: its place when numbered, the lamp otherwise */}
      {number ? (
        <span
          className="font-heading tracking-normal text-muted tabular-nums group-aria-[current=page]/row:text-accent-text"
          aria-hidden="true"
        >
          <Place number={number} />
        </span>
      ) : (
        <span className={cn(navStyles.lamp, styles.lamp)} aria-hidden="true" />
      )}
      <span className="min-w-0 flex-1">{children}</span>
      {note && <span className="flex-none text-step--3 leading-4 tracking-[0.08em] text-muted tabular-nums">{note}</span>}
    </Plate>
  );
}

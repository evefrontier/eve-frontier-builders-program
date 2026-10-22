import type { ReactNode } from "react";
import { Plate } from "@/components/ui";
import { EXTERNAL } from "@/lib/external";

/** A section quoted from the EVE Frontier builder docs, with a link to its source. */
export function Excerpt({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return (
    <Plate as="figure" corners="tr-bl" className="mt-m px-s py-s">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-s text-step--1 text-muted">
        <span>
          From the builder docs: <span className="font-bold text-foreground">{title}</span>
        </span>
        <a href={href} {...EXTERNAL} className="text-accent-text underline underline-offset-2">
          View source<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </figcaption>
      <blockquote className="mt-xs">{children}</blockquote>
    </Plate>
  );
}

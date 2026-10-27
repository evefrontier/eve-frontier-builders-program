import Link from "next/link";
import { Plate } from "@/components/ui";
import { nav } from "@/app/agentic/_content";

/** A stand-in top bar for the prototype pages, until the site's own top bar lands. */
export function PrototypeBar() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex min-h-(--bar-height) max-w-grid items-center justify-between gap-s px-s-l">
        <Link href="/start/" className="font-heading text-step-2 font-bold text-foreground no-underline">
          EF-B
        </Link>
        <Link href="/start/" className="ml-auto text-step--1 font-bold text-muted no-underline hover:text-foreground">
          {nav.startOver}
        </Link>
        <Plate
          as="span"
          corners="tl-br"
          cut="sm"
          keyline="var(--color-tint-border)"
          fill="var(--color-tint-background)"
          className="px-xs py-3xs text-step--2 font-bold tracking-[0.06em] text-tint-text uppercase"
        >
          Prototype
        </Plate>
      </div>
    </header>
  );
}

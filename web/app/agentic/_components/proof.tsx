import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import { conversationUi, type Visual } from "@/app/agentic/_content";
import { PixelArt } from "./pixel-art";

/**
 * A mocked result the AI shows as proof: a test result, a page behind a
 * private test link, or the same on a phone. Drawn from plain parts rather
 * than screenshots, so it reads as an example, not a real product.
 */
export function Proof({ visual }: { visual: Visual }) {
  return (
    <figure className={cn("mt-xs", visual.kind === "phone" && "max-w-[16rem]")}>
      <Plate corners="tl" cut="sm" fill="var(--color-background)" className="grid">
        <figcaption className="flex items-center gap-2xs border-b border-line px-xs py-3xs text-step--3 font-bold tracking-[0.06em] text-muted uppercase">
          <span className={cn("size-1.5", visual.kind === "test" ? "bg-accent" : "bg-muted")} aria-hidden="true" />
          {conversationUi.frames[visual.kind]}
        </figcaption>
        <div className="grid gap-2xs px-xs py-xs">
          <span className="font-heading text-step--1 font-bold">{visual.title}</span>
          <ul className="grid gap-3xs text-step--2">
            {visual.rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-s border-b border-line pb-3xs last:border-0">
                <span className="flex items-center gap-2xs">
                  {row.pass && <PixelArt name="tick" cell={2} className="text-accent-text" />}
                  {row.label}
                </span>
                <span className="font-bold whitespace-nowrap">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
        {visual.footer && (
          <p className="border-t border-line px-xs py-3xs text-step--3 text-muted">{visual.footer}</p>
        )}
      </Plate>
    </figure>
  );
}

import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/cn";

/*
 * Icons are drawn on a grid of square cells, "#" filled and "." empty, the
 * same language as the site's pixel artwork. Size them at a whole multiple
 * of their grid (a 5 × 5 glyph at 10, 15 or 20px, a 6 × 6 one at 12, 18 or
 * 24px) so every cell lands on whole pixels and stays crisp.
 */
const glyphs = {
  cross: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
  "forward-slash": ["....#", "...#.", "..#..", ".#...", "#...."],
  /* Points down; rotate-180 turns it over when a menu opens */
  caret: [".....", "#...#", ".#.#.", "..#..", "....."],
  /* Up and to the right, after a link that opens in a new tab */
  external: ["..###", "...##", "..#.#", ".#...", "#...."],
  /* Two links of a chain, for copying a link to part of a page */
  link: ["..####", "..#..#", "####.#", "#.####", "#..#..", "####.."],
} satisfies Record<string, string[]>;

export type IconName = keyof typeof glyphs;

export const iconNames = Object.keys(glyphs) as IconName[];

/** Each icon's grid in cells; it stays crisp at whole multiples of it. */
export const iconGrids = Object.fromEntries(
  Object.entries(glyphs).map(([name, rows]) => [name, rows.length]),
) as Record<IconName, number>;

const icons = Object.fromEntries(
  Object.entries(glyphs).map(([name, rows]) => [
    name,
    {
      viewBox: `0 0 ${rows[0].length} ${rows.length}`,
      d: rows
        .flatMap((row, y) => [...row].map((cell, x) => (cell === "#" ? `M${x} ${y}h1v1h-1z` : "")))
        .join(""),
    },
  ]),
) as Record<IconName, { viewBox: string; d: string }>;

export type IconProps = {
  name: IconName;
} & Omit<ComponentPropsWithRef<"svg">, "children" | "viewBox">;

/**
 * A pixel icon in the current text colour, sized to the text unless given a
 * `size-*` class. Decorative by default; pass `aria-label` when the icon is
 * the only thing carrying its meaning.
 *
 * @example
 * ```tsx
 * <button type="button" aria-label="Clear">
 *   <Icon name="cross" className="size-2.5 text-accent-text" />
 * </button>
 * ```
 */
export function Icon({ name, className, ...rest }: IconProps) {
  const { viewBox, d } = icons[name];
  const labelled = rest["aria-label"] !== undefined || rest["aria-labelledby"] !== undefined;

  return (
    <svg
      viewBox={viewBox}
      shapeRendering="crispEdges"
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      {...rest}
      className={cn("size-[1em] shrink-0 fill-current", className)}
    >
      <path d={d} />
    </svg>
  );
}

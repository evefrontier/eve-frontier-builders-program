import { cn } from "@/lib/cn";

/*
 * Small pictures drawn on a grid of square cells, in the same language as the
 * site's pixel icons: "#" is ink (the current text colour), "o" is accent and
 * "." is empty. Drawn rather than screenshotted, so they never show a real app
 * that will look dated in a year, and they follow light and dark mode.
 */
export const pixels = {
  /* Ladder rungs */
  sparkle: [
    "...........",
    ".....#.....",
    ".....#.....",
    "....#o#....",
    "..##ooo##..",
    "....#o#....",
    ".....#.....",
    ".....#.....",
    "...........",
  ],
  chat: [
    "###########",
    "#.........#",
    "#.ooooooo.#",
    "#.........#",
    "#.ooooo...#",
    "#.........#",
    "####.######",
    "...#.#.....",
    "...##......",
  ],
  folder: [
    ".####......",
    "#....######",
    "#.........#",
    "#..o.o.o..#",
    "#.........#",
    "#..o.o.o..#",
    "#.........#",
    "#.........#",
    "###########",
  ],
  editor: [
    "###########",
    "#.o.o.....#",
    "###########",
    "#.........#",
    "#.ooo.....#",
    "#...oooo..#",
    "#.oo......#",
    "#.........#",
    "###########",
  ],
  cloud: [
    "...........",
    "....###....",
    "...#...##..",
    ".##......#.",
    "#..o.o.o..#",
    "#.........#",
    ".#########.",
    "...........",
    "...........",
  ],
  /* The three roles */
  person: [
    "....###....",
    "....#o#....",
    "....###....",
    "...........",
    "..#######..",
    ".#.#####.#.",
    "...#####...",
    "...##.##...",
    "...##.##...",
  ],
  agent: [
    ".....o.....",
    "..#######..",
    "..#.o.o.#..",
    "..#.....#..",
    "..#.###.#..",
    "..#######..",
    ".#.#####.#.",
    "...#...#...",
    "...#...#...",
  ],
  tool: [
    "###########",
    "#.........#",
    "#.......o.#",
    "#......o..#",
    "#.o...o...#",
    "#..o.o....#",
    "#...o.....#",
    "###########",
    "....###....",
  ],
  /* Small marks */
  file: ["####.", "#..##", "#...#", "#.o.#", "#...#", "#####"],
  tick: [".....", "....#", "...#.", "#.#..", ".#...", "....."],
} satisfies Record<string, string[]>;

export type PixelName = keyof typeof pixels;

const cells = (rows: string[], mark: string) =>
  rows.flatMap((row, y) => [...row].map((cell, x) => (cell === mark ? `M${x} ${y}h1v1h-1z` : ""))).join("");

/** A pixel picture at a whole number of screen pixels per cell, so every cell stays crisp. */
export function PixelArt({ name, cell = 4, className }: { name: PixelName; cell?: number; className?: string }) {
  const rows = pixels[name];
  return (
    <svg
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      width={rows[0].length * cell}
      height={rows.length * cell}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={cn("flex-none", className)}
    >
      <path d={cells(rows, "#")} className="fill-current" />
      <path d={cells(rows, "o")} className="fill-accent" />
    </svg>
  );
}

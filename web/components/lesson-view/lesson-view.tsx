"use client";

import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { Accordion, AccordionItem, AccordionLink, Icon, ThemeToggle } from "@/components/ui";
import navStyles from "@/components/ui/nav-item.module.css";
import { Placeholder } from "@/components/placeholder";
import type { CourseOutline } from "@/lib/curriculum";
import { cn } from "@/lib/cn";
import styles from "./lesson-view.module.css";

export type LessonViewProps = {
  course: CourseOutline;
  /** The lesson's own content, under its heading */
  children: ReactNode;
};

type Panel = "rail" | "bench";

const LABELS: Record<Panel, string> = { rail: "Lessons", bench: "Workbench" };

/* The side panes' surface */
const SIDE = "bg-card bg-grain";

/* Pane widths at lg, in px. The workbench gives way so the lesson keeps a readable measure. */
const RAIL = 312;
const GRIP = 7;
const BENCH = 348;
const BENCH_MIN = 280;
const LESSON_MIN = 360;
const STEP = 24;

/* Modules numbered 01, 02, and each one's lessons 1.1, 1.2 under it */
function numbered(course: CourseOutline) {
  return course.modules.map((entry, i) => ({
    ...entry,
    number: String(i + 1).padStart(2, "0"),
    lessons: entry.lessons.map((item, j) => ({ ...item, number: `${i + 1}.${j + 1}` })),
  }));
}

/**
 * The lesson view: an app bar over three panes, the course's contents, the
 * lesson and a workbench, which is a placeholder until lessons have one.
 * Either side pane folds from the bar and the divider resizes the workbench.
 * Below lg the side panes become sheets, opened from a bar at the foot.
 *
 * It reads the module and lesson from the route, so it belongs in the
 * course's layout, where it keeps its state from one lesson to the next.
 *
 * @example
 * ```tsx
 * <LessonView course={getCourseOutline("example-course")}>{children}</LessonView>
 * ```
 */
export function LessonView({ course, children }: LessonViewProps) {
  const { module, lesson } = useParams<{ module: string; lesson: string }>();
  const modules = numbered(course);
  const current = modules.find((entry) => entry.slug === module);
  const here = current?.lessons.find((entry) => entry.slug === lesson);

  const id = useId();
  const ids: Record<Panel, string> = { rail: `${id}-rail`, bench: `${id}-bench` };

  const [shown, setShown] = useState<Record<Panel, boolean>>({ rail: true, bench: true });
  const [sheet, setSheet] = useState<Panel | null>(null);
  const [bench, setBench] = useState(BENCH);
  const [dragging, setDragging] = useState(false);

  // The module on screen starts open, and opens again when the route moves to another
  const [open, setOpen] = useState([module]);
  const [opened, setOpened] = useState(module);
  if (opened !== module) {
    setOpened(module);
    if (!open.includes(module)) setOpen([...open, module]);
  }

  // A width the grip asks for, held to what the panes leave once the lesson has its
  // measure. The grid holds the same limits, so a smaller window or an opened rail
  // pulls the workbench back without a render.
  const fit = (px: number, panes: HTMLElement) => {
    const most = panes.clientWidth - (shown.rail ? RAIL : 0) - GRIP - LESSON_MIN;
    return Math.round(Math.max(BENCH_MIN, Math.min(most, px)));
  };

  // A sheet takes focus as it opens; Escape shuts it and hands focus back to its button
  useEffect(() => {
    if (!sheet) return;
    const pane = `${id}-${sheet}`;
    document.getElementById(pane)?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSheet(null);
      document.getElementById(`${pane}-toggle`)?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheet, id]);

  // Following a lesson link leaves the sheet behind
  const closeOnLink = (event: MouseEvent) => {
    if ((event.target as Element).closest("a[href]")) setSheet(null);
  };

  const onGripDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onGripMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const panes = event.currentTarget.parentElement;
    if (dragging && panes) setBench(fit(panes.getBoundingClientRect().right - event.clientX, panes));
  };

  const onGripKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const panes = event.currentTarget.parentElement;
    // From the width on screen, which the grid may have pulled in since it was last set
    const width = document.getElementById(ids.bench)?.offsetWidth;
    if (!panes || !width) return;
    const asked = { ArrowLeft: width + STEP, ArrowRight: width - STEP, Home: BENCH_MIN, End: panes.clientWidth }[event.key];
    if (asked === undefined) return;
    event.preventDefault();
    setBench(fit(asked, panes));
  };

  const pane = (panel: Panel, visible: boolean) =>
    cn(
      "min-h-0 min-w-0 outline-none",
      // Folded, the pane keeps its grid slot at no width, so the ones after it don't shift
      !visible && "lg:invisible",
      // A sheet lies over the lesson, so it takes the solid line an open list does
      sheet === panel
        ? "max-lg:absolute max-lg:inset-x-0 max-lg:top-[42%] max-lg:bottom-0 max-lg:z-(--layer-raised) max-lg:border-t max-lg:border-foreground"
        : "max-lg:hidden",
    );

  return (
    <div
      // One column that can shrink, or the bar's unbroken title would set the page's width
      className="grid h-dvh w-full grid-cols-1 grid-rows-[auto_1fr_auto] lg:grid-rows-[auto_1fr]"
      // Widths the pointer and the folds set can only be inline; a folded pane closes to nothing
      style={
        {
          "--lesson-rail": `${shown.rail ? RAIL : 0}px`,
          "--lesson-grip": `${shown.bench ? GRIP : 0}px`,
          "--lesson-bench": `${shown.bench ? bench : 0}px`,
          "--lesson-bench-min": `${shown.bench ? BENCH_MIN : 0}px`,
          "--lesson-min": `${LESSON_MIN}px`,
        } as CSSProperties
      }
    >
      {/* At lg the first column is the rail's, so the title starts over the lesson, a gutter in as its heading is */}
      <header
        className={cn(
          "flex h-16 items-center gap-x-s border-b border-line bg-background bg-grain px-s",
          "lg:grid lg:grid-cols-[minmax(max-content,var(--lesson-rail))_minmax(0,1fr)_auto] lg:gap-x-0 lg:pl-0",
        )}
      >
        <Link
          href={`/courses/${course.slug}/`}
          className={cn(
            "flex min-h-11 min-w-6 flex-none items-center gap-3 justify-self-start text-step--2 font-bold tracking-[0.08em] uppercase lg:ml-s",
            "hover:text-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
          )}
        >
          <Icon name="caret" className="size-3 rotate-90" />
          <span className="max-sm:sr-only">Course</span>
        </Link>
        <p className="min-w-0 truncate font-heading text-step--1 font-bold lg:pl-s-m">{course.title}</p>
        <div className="flex flex-none items-center gap-s max-lg:ml-auto lg:pl-s">
          <div className="flex items-center max-lg:hidden" role="group" aria-label="Panels">
            <PanelToggle
              label={LABELS.rail}
              controls={ids.rail}
              expanded={shown.rail}
              onToggle={() => setShown((s) => ({ ...s, rail: !s.rail }))}
              className="pr-0.5 pl-2"
            />
            <span className="px-0.5 text-muted" aria-hidden="true">
              <Blocks columns={5} />
            </span>
            <PanelToggle
              label={LABELS.bench}
              controls={ids.bench}
              expanded={shown.bench}
              onToggle={() => setShown((s) => ({ ...s, bench: !s.bench }))}
              className="pr-2 pl-0.5"
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Positioned, for the sheets below lg, and clipped, as a folded pane's contents still have a width.
          The workbench takes the width asked of it as far as the lesson's own floor allows. */}
      <div
        className={cn(
          "relative grid min-h-0 grid-cols-1 overflow-clip",
          "lg:grid-cols-[var(--lesson-rail)_minmax(var(--lesson-min),1fr)_var(--lesson-grip)_minmax(var(--lesson-bench-min),var(--lesson-bench))]",
        )}
      >
        <nav
          id={ids.rail}
          aria-label={LABELS.rail}
          tabIndex={-1}
          className={cn(pane("rail", shown.rail), SIDE, "lg:border-r lg:border-line")}
          onClick={closeOnLink}
        >
          <Pane>
            <Accordion value={open} onValueChange={setOpen} className="px-3 pt-4 pb-12">
              {modules.map((entry) => (
                <AccordionItem key={entry.slug} value={entry.slug} number={entry.number} title={entry.title}>
                  <ol role="list">
                    {entry.lessons.map((item) => (
                      <li key={item.slug}>
                        <AccordionLink
                          href={`/courses/${course.slug}/${entry.slug}/${item.slug}/`}
                          number={item.number}
                          note={item.duration}
                          current={item.slug === lesson}
                        >
                          {item.title}
                        </AccordionLink>
                      </li>
                    ))}
                  </ol>
                </AccordionItem>
              ))}
            </Accordion>
          </Pane>
        </nav>

        <main className="min-h-0 min-w-0">
          {/* Keyed, so each lesson starts at its top */}
          <Pane key={lesson}>
            <div className="mx-auto grid max-w-220 gap-s px-s-m pt-s pb-xl">
              <hgroup className="grid gap-2xs">
                {current && (
                  <p className="text-step--2 font-bold tracking-[0.08em] text-muted uppercase">
                    Module {current.number} · {current.title}
                  </p>
                )}
                <h1 className="font-heading text-step-3 font-bold">{here?.title ?? lesson}</h1>
                {here?.duration && <p className="text-step--2 text-muted">{here.duration}</p>}
              </hgroup>
              {children}
            </div>
          </Pane>
        </main>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize the workbench"
          aria-controls={ids.bench}
          aria-valuenow={bench}
          aria-valuemin={BENCH_MIN}
          tabIndex={shown.bench ? 0 : -1}
          data-drag={dragging || undefined}
          onPointerDown={onGripDown}
          onPointerMove={onGripMove}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onLostPointerCapture={() => setDragging(false)}
          onKeyDown={onGripKey}
          className={cn("bg-line max-lg:hidden forced-colors:bg-[CanvasText]", !shown.bench && "invisible", styles.grip)}
        />

        <aside
          id={ids.bench}
          aria-label={LABELS.bench}
          tabIndex={-1}
          className={cn(pane("bench", shown.bench), SIDE, "flex flex-col lg:border-l lg:border-line")}
        >
          <Placeholder
            as="div"
            name="Workbench"
            note="On lessons that need one: a terminal, a query runner or other hands-on pieces"
            className="m-xs flex-1"
          />
        </aside>
      </div>

      <div role="group" aria-label="Panels" className="flex gap-1.5 border-t border-line bg-background bg-grain px-2.5 py-1.5 lg:hidden">
        {(["rail", "bench"] as const).map((panel) => (
          <button
            key={panel}
            id={`${ids[panel]}-toggle`}
            type="button"
            aria-expanded={sheet === panel}
            aria-controls={ids[panel]}
            onClick={() => setSheet((open) => (open === panel ? null : panel))}
            className={cn(
              "flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2.5 text-step--2 font-bold tracking-[0.08em] text-muted uppercase",
              "hover:text-foreground aria-expanded:bg-card aria-expanded:text-foreground",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground",
              styles.tab,
            )}
          >
            <span className={cn(navStyles.lamp, styles.lamp)} aria-hidden="true" />
            {LABELS[panel]}
          </button>
        ))}
      </div>
    </div>
  );
}

/* A pane that scrolls on its own, its scrollbar a block in the lamps' grain that shows while the pane is in use */
function Pane({ children }: { children: ReactNode }) {
  return (
    <ScrollArea.Root className="h-full">
      <ScrollArea.Viewport className="h-full overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground">
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className={cn("inset-y-0 right-0 flex w-3 justify-center", styles.scrollbar)}>
        <ScrollArea.Thumb className={cn("w-2", styles.thumb)} />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

type PanelToggleProps = { label: string; controls: string; expanded: boolean; onToggle: () => void; className: string };

function PanelToggle({ label, controls, expanded, onToggle, className }: PanelToggleProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={label}
      title={`${expanded ? "Hide" : "Show"} ${label}`}
      onClick={onToggle}
      className={cn(
        "grid h-11 min-w-6 cursor-pointer place-items-center text-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground",
        // Stacked, because an aria variant alone would outrank hover and focus
        "aria-[expanded=false]:text-control-line",
        "hover:text-foreground focus-visible:text-foreground aria-[expanded=false]:hover:text-foreground aria-[expanded=false]:focus-visible:text-foreground",
        className,
      )}
    >
      <Blocks columns={3} />
    </button>
  );
}

/* A pane drawn small in the lamps' grain: 2px squares on a 3px pitch, seven rows deep */
function Blocks({ columns }: { columns: number }) {
  const rows = 7;
  return (
    <svg
      width={columns * 3 - 1}
      height={rows * 3 - 1}
      viewBox={`0 0 ${columns * 3 - 1} ${rows * 3 - 1}`}
      fill="currentColor"
      aria-hidden="true"
      className="block flex-none"
    >
      {Array.from({ length: columns * rows }, (_, i) => (
        <rect key={i} x={(i % columns) * 3} y={Math.floor(i / columns) * 3} width="2" height="2" />
      ))}
    </svg>
  );
}

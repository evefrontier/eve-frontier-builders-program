"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { Course } from "@/lib/content/load";
import { cn } from "@/lib/cn";
import { minutesOf } from "@/lib/minutes";
import { useDone } from "./progress";

const idx = "font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase";

export type PortalShellProps = {
  course: Course;
  /** The address of the page being shown, since a lesson can appear in more than one course. */
  current: string;
  outline: ReactNode;
  children: ReactNode;
};

/**
 * The lesson player: an app bar over three columns that scroll on their own,
 * the course syllabus, the lesson and an outline. Either rail folds away;
 * folding sets its column to zero so the grid keeps its order. Below lg the
 * page scrolls normally and the rails open as sheets from a bottom bar.
 */
export function PortalShell({ course, current, outline, children }: PortalShellProps) {
  const [rail, setRail] = useState(true);
  const [side, setSide] = useState(true);
  const [sheet, setSheet] = useState<"rail" | "side" | null>(null);
  const done = useDone();

  const lessons = course.modules.flatMap((m) => m.lessons);
  const index = lessons.findIndex((l) => l.href === current);

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:min-h-0">
      <header className="sticky top-0 z-(--layer-sticky) flex h-(--bar-height) flex-none items-center gap-x-s border-b border-line bg-background px-s">
        <Link href="/courses" className="flex flex-none items-center gap-2xs text-step--1 font-bold">
          <span aria-hidden="true">←</span>
          <span className="max-md:sr-only">All courses</span>
        </Link>
        <p className="flex min-w-0 items-baseline gap-xs">
          <Link href={course.href} className="truncate font-heading text-step-0 font-bold hover:text-accent-text">{course.title}</Link>
          {course.pillar !== undefined && <span className="whitespace-nowrap text-step--2 text-muted max-lg:hidden">Pillar {course.pillar}</span>}
        </p>
        <div className="ml-auto flex flex-none items-center gap-xs">
          <span className={cn(idx, "max-md:hidden")}>
            {index >= 0 ? `Lesson ${index + 1} of ${lessons.length}` : `${lessons.length} lessons`}
          </span>
          <span aria-hidden="true" className="flex gap-0.5">
            {lessons.map((l) => (
              <i key={l.href} className={cn("h-3.5 w-2", l.href === current ? "bg-accent" : done.has(l.file) ? "bg-foreground" : "bg-line")} />
            ))}
          </span>
        </div>
        <div className="flex flex-none gap-2xs max-lg:hidden">
          <FoldButton pressed={rail} onClick={() => setRail(!rail)}>Contents</FoldButton>
          <FoldButton pressed={side} onClick={() => setSide(!side)}>Outline</FoldButton>
        </div>
      </header>

      <div
        className={cn(
          "grow lg:grid lg:min-h-0",
          rail && side && "lg:grid-cols-[19rem_minmax(0,1fr)_18rem]",
          rail && !side && "lg:grid-cols-[19rem_minmax(0,1fr)_0]",
          !rail && side && "lg:grid-cols-[0_minmax(0,1fr)_18rem]",
          !rail && !side && "lg:grid-cols-[0_minmax(0,1fr)_0]",
        )}
      >
        <div
          className={cn(
            "overflow-y-auto overscroll-contain border-line bg-card lg:border-r",
            !rail && "lg:invisible lg:border-r-0",
            sheet === "rail" ? "max-lg:fixed max-lg:inset-x-0 max-lg:top-[42%] max-lg:bottom-13 max-lg:z-(--layer-scrim) max-lg:border-t" : "max-lg:hidden",
          )}
        >
          <Syllabus course={course} current={current} done={done} />
        </div>

        <main className="min-w-0 overflow-y-auto overscroll-contain max-lg:pb-16">{children}</main>

        <aside
          aria-label="In this lesson"
          className={cn(
            "overflow-y-auto overscroll-contain border-line bg-card lg:border-l",
            !side && "lg:invisible lg:border-l-0",
            sheet === "side" ? "max-lg:fixed max-lg:inset-x-0 max-lg:top-[42%] max-lg:bottom-13 max-lg:z-(--layer-scrim) max-lg:border-t" : "max-lg:hidden",
          )}
        >
          {outline}
        </aside>
      </div>

      <nav aria-label="Lesson panels" className="fixed inset-x-0 bottom-0 z-(--layer-scrim) flex h-13 bg-foreground text-background lg:hidden">
        {(["rail", "side"] as const).map((name) => (
          <button
            key={name}
            type="button"
            aria-expanded={sheet === name}
            onClick={() => setSheet(sheet === name ? null : name)}
            className="flex-1 text-step--1 font-bold opacity-65 aria-expanded:opacity-100 aria-expanded:shadow-[inset_0_-2px_0_var(--color-accent)]"
          >
            {name === "rail" ? "Lessons" : "In this lesson"}
          </button>
        ))}
      </nav>
    </div>
  );
}

function FoldButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="min-h-8 border border-line px-xs text-step--2 font-bold text-muted aria-pressed:border-foreground aria-pressed:text-foreground"
    >
      {children}
    </button>
  );
}

/** The course's progress and its modules, each folding open on the current one. */
function Syllabus({ course, current, done }: { course: Course; current: string; done: ReadonlySet<string> }) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  const complete = lessons.filter((l) => done.has(l.file)).length;
  const left = lessons.filter((l) => !done.has(l.file)).reduce((sum, l) => sum + minutesOf(l.duration), 0);
  const percent = lessons.length ? Math.round((complete / lessons.length) * 100) : 0;

  return (
    <div className="grid gap-s px-s pt-s pb-xl">
      <div className="border border-line bg-background px-s py-xs">
        <p className="flex items-baseline justify-between gap-xs">
          <b className="font-heading text-step-1">{percent}%</b>
          <span className="text-step--2 text-muted">{left ? `${left} min left` : complete ? "All done" : ""}</span>
        </p>
        <p className="sr-only">{complete} of {lessons.length} lessons complete</p>
        <span aria-hidden="true" className="mt-2xs flex gap-0.5">
          {lessons.map((l) => (
            <i key={l.href} className={cn("h-2 flex-1", done.has(l.file) ? "bg-accent" : "bg-line")} />
          ))}
        </span>
      </div>

      <nav aria-label="Modules and lessons" className="grid gap-2xs">
        {course.modules.map((module, i) => {
          const open = module.href === current || module.lessons.some((l) => l.href === current);
          return (
            <details key={module.href} open={open || undefined} className="group border border-line bg-background">
              <summary className="grid cursor-pointer list-none grid-cols-[1.5rem_minmax(0,1fr)_0.75rem] items-center gap-xs px-xs py-xs [&::-webkit-details-marker]:hidden">
                <span className="text-step--2 font-bold text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-step--1 leading-tight font-bold">{module.title}</span>
                <span aria-hidden="true" className="text-muted group-open:rotate-45">+</span>
              </summary>
              <ol className="grid gap-px px-xs pb-xs">
                {[{ ...module, title: "Introduction", duration: undefined }, ...module.lessons].map((page) => {
                  const here = page.href === current;
                  const state = here ? "here" : done.has(page.file) ? "done" : "next";
                  return (
                    <li key={page.href}>
                      <Link
                        href={page.href}
                        aria-current={here ? "page" : undefined}
                        className={cn(
                          "grid grid-cols-[0.75rem_minmax(0,1fr)_auto] items-center gap-xs px-2xs py-2xs text-step--1",
                          here ? "bg-tint-background font-bold" : "hover:bg-card-secondary",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-3",
                            state === "here" && "bg-accent shadow-[0_0_8px_1px_var(--color-accent)]",
                            state === "done" && "bg-foreground",
                            state === "next" && "border border-line",
                          )}
                        />
                        <span>
                          {page.title}
                          {state === "done" && <span className="sr-only"> (complete)</span>}
                        </span>
                        <span className="text-step--2 text-muted tabular-nums">{page.duration?.replace(/\s*min.*/, "m")}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}
      </nav>
    </div>
  );
}

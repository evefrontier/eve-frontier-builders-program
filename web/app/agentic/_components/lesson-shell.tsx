import type { ReactNode } from "react";
import Link from "next/link";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import { course, footer, lessons, nav } from "@/app/agentic/_content";
import { PrototypeBar } from "./prototype-bar";
import { primaryAction } from "./styles";

/** Every screen in course order, with the lesson it belongs to. */
export const screens = lessons.flatMap((lesson, lessonIndex) =>
  lesson.screens.map((screen) => ({ ...screen, lesson: lesson.title, lessonIndex })),
);

/** One screen of the course: where you are, one idea, and one way on. */
export function LessonShell({ slug, children }: { slug: string; children: ReactNode }) {
  const index = screens.findIndex((screen) => screen.slug === slug);
  const screen = screens[index];
  const previous = screens[index - 1];
  const next = screens[index + 1];

  return (
    <>
      <PrototypeBar />
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-grid flex-wrap items-center gap-x-s gap-y-2xs px-s-l py-xs">
          <Link href="/agentic/" className="text-step--1 font-bold text-foreground no-underline hover:text-accent-text">
            <span aria-hidden="true">← </span>
            {course.title}
          </Link>
          {previous && (
            <Link
              href={`/agentic/${previous.slug}/`}
              className="ml-auto text-step--1 font-bold text-muted no-underline hover:text-foreground"
            >
              ← {nav.previous}
            </Link>
          )}
          <span
            className={cn(
              "text-step--2 font-bold tracking-[0.06em] whitespace-nowrap text-muted uppercase",
              !previous && "ml-auto",
            )}
          >
            {index + 1} of {screens.length}
          </span>
          {/* One segment per screen, a gap between lessons */}
          <span aria-hidden="true" className="flex gap-1.5">
            {lessons.map((lesson, lessonIndex) => (
              <span key={lesson.title} className="flex gap-0.5">
                {screens
                  .map((item, i) => ({ item, i }))
                  .filter(({ item }) => item.lessonIndex === lessonIndex)
                  .map(({ item, i }) => (
                    <i
                      key={item.slug}
                      className={cn("h-3.5 w-2", i === index ? "bg-accent" : i < index ? "bg-foreground" : "bg-line")}
                    />
                  ))}
              </span>
            ))}
          </span>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-[52rem] flex-1 content-start gap-l px-s-l py-xl">
        <header className="grid gap-xs">
          <span className="text-step--1 font-bold tracking-[0.06em] text-accent-text uppercase">
            Lesson {screen.lessonIndex + 1} · {screen.lesson}
          </span>
          <h1 className="text-step-4">{screen.title}</h1>
          <p className="max-w-[44rem] text-step-1 text-muted">{screen.lead}</p>
        </header>

        {children}

        <nav aria-label="Course" className="mt-s flex flex-wrap items-center justify-between gap-s border-t border-line pt-m">
          <Link
            href={previous ? `/agentic/${previous.slug}/` : "/agentic/"}
            className="text-step--1 font-bold text-muted no-underline hover:text-foreground"
          >
            ← {previous ? previous.title : nav.overview}
          </Link>
          <Plate
            as={Link}
            href={next ? `/agentic/${next.slug}/` : "/agentic/"}
            corners="tr-bl"
            cut="sm"
            className={primaryAction}
          >
            {next ? `Next: ${next.title}` : "Back to the course"} →
          </Plate>
        </nav>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-grid gap-3xs px-s-l py-m text-step--2 text-muted">
          <p>{footer.prototype}</p>
          <p>{footer.checked}</p>
        </div>
      </footer>
    </>
  );
}

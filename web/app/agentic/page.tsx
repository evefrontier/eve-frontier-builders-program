import type { Metadata } from "next";
import Link from "next/link";
import { Plate } from "@/components/ui";
import { course, footer, lessons } from "@/app/agentic/_content";
import { primaryAction } from "./_components/styles";
import { PrototypeBar } from "./_components/prototype-bar";
import { YourIdea } from "./_components/your-idea";

export const metadata: Metadata = {
  title: `${course.title} · EVE Frontier Builders`,
  description: course.body,
};

export default function CoursePage() {
  const first = lessons[0].screens[0];

  return (
    <>
      <PrototypeBar />
      <section className="border-b border-line bg-card">
        <div className="mx-auto grid w-full max-w-grid gap-s px-s-l py-xl">
          <span className="text-step--1 font-bold tracking-[0.06em] text-accent-text uppercase">{course.kicker}</span>
          <h1 className="text-step-5">{course.title}</h1>
          <p className="max-w-[44rem] text-step-1 text-muted">{course.body}</p>
          <p className="text-step--1 text-muted">{course.stats}</p>
          <YourIdea label={course.yourIdea} />
          <div className="mt-xs">
            <Plate as={Link} href={`/agentic/${first.slug}/`} corners="tr-bl" cut="sm" className={primaryAction}>
              {course.start} →
            </Plate>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-grid flex-1 content-start gap-s px-s-l py-xl">
        <ol className="grid gap-s md:grid-cols-3">
          {lessons.map((lesson, index) => (
            <li key={lesson.title} className="flex">
              <Plate corners="tr-bl" cut="md" className="grid flex-1 content-start gap-xs p-m">
                <span className="text-step--2 font-bold tracking-[0.06em] text-accent-text uppercase">Lesson {index + 1}</span>
                <h2 className="text-step-2">{lesson.title}</h2>
                <ol className="grid gap-2xs">
                  {lesson.screens.map((screen) => (
                    <li key={screen.slug}>
                      <Link
                        href={`/agentic/${screen.slug}/`}
                        className="text-step--1 text-foreground no-underline hover:text-accent-text"
                      >
                        {screen.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </Plate>
            </li>
          ))}
        </ol>
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

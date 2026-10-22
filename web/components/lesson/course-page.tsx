import Link from "next/link";
import { Plate } from "@/components/ui";
import { getCourses, renderMarkdown } from "@/lib/content/load";
import { eyebrow } from "./content-page";
import { courseStats } from "./course-card";
import { Markdown } from "./markdown";
import { SiteHeader } from "./site-header";

/** A course's overview: what it covers, a way in, and its syllabus. */
export function CoursePage({ slug }: { slug: string }) {
  const course = getCourses().find((c) => c.slug === slug)!;
  const intro = renderMarkdown(course.intro ?? "", course.file);
  const first = course.modules[0]?.lessons[0] ?? course.modules[0];

  return (
    <>
      <SiteHeader current="courses" />
      <section className="border-b border-line bg-card">
        <div className="mx-auto grid w-full max-w-[90rem] gap-s px-s-l py-xl">
          <p className={eyebrow}>
            <Link href="/courses" className="hover:text-foreground">Courses</Link>
            {course.pillar !== undefined && <> · Pillar {course.pillar}</>}
          </p>
          <h1 className="text-step-5">{course.title}</h1>
          {course.description && <p className="max-w-[60ch] text-step-1 text-muted">{course.description}</p>}
          <p className="text-step--1 text-muted">{courseStats(course)}</p>
          {first && (
            <div className="mt-xs">
              <Plate
                as={Link}
                href={first.href}
                corners="tr-bl"
                className="inline-flex min-h-11 items-center px-m font-bold text-text-on-accent [--plate-fill:var(--color-accent)] [--plate-keyline:var(--color-accent-keyline)] hover:[--plate-fill:var(--color-accent-hover)]"
              >
                Start the course
              </Plate>
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-[90rem] gap-l px-s-l py-l">
        {intro.children.length > 0 && (
          <div className="max-w-[52rem]">
            <Markdown nodes={intro.children} />
          </div>
        )}
        <section aria-labelledby="syllabus" className="max-w-[52rem]">
          <h2 id="syllabus" className="text-step-3">Syllabus</h2>
          <ol className="mt-s grid gap-2xs">
            {course.modules.map((module, i) => (
              <li key={module.file}>
                <details open={i === 0 || undefined} className="group border border-line bg-card">
                  <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_minmax(0,1fr)_auto_1rem] items-center gap-s px-s py-xs [&::-webkit-details-marker]:hidden">
                    <span className="font-heading text-step-0 text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-bold">{module.title}</span>
                      {module.description && <span className="block text-step--1 text-muted">{module.description}</span>}
                    </span>
                    <span className="text-step--2 text-muted">{module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}</span>
                    <span aria-hidden="true" className="text-muted group-open:rotate-45">+</span>
                  </summary>
                  <ol className="border-t border-line px-s py-2xs">
                    {[{ ...module, title: "Introduction", duration: undefined }, ...module.lessons].map((item) => (
                      <li key={item.file}>
                        <Link href={item.href} className="grid grid-cols-[minmax(0,1fr)_auto] gap-s py-2xs hover:text-accent-text">
                          <span>{item.title}</span>
                          <span className="text-step--2 text-muted">{item.duration}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </details>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}

import Link from "next/link";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import { getOutline, getPage, getResources, getTerms, inCourse, renderMarkdown } from "@/lib/content/load";
import { Markdown } from "@/components/lesson/markdown";
import { LessonTabs, MarkComplete } from "./lesson-tabs";
import { PortalShell } from "./portal-shell";

const idx = "font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase";

/**
 * A module or lesson page in the lesson player. The Markdown is the Overview
 * tab; the syllabus, resources, outline and terms all come from the content.
 */
export function Portal({ course: courseSlug, module: moduleSlug, lesson: lessonSlug }: { course: string; module: string; lesson?: string }) {
  const { course, module, lesson, previous, next } = inCourse(courseSlug, moduleSlug, lessonSlug)!;
  const here = lesson ?? module;
  const file = here.file;
  // A module's page is its intro from the curriculum; a lesson's is its Markdown file
  const page = lesson
    ? getPage(lesson.file)
    : { title: module.title, description: module.description, duration: undefined, root: renderMarkdown(module.intro ?? "", module.file) };
  const outline = getOutline(page.root);
  const terms = getTerms(page.root);
  const moduleNumber = course.modules.indexOf(module) + 1;

  return (
    <PortalShell
      course={course}
      current={here.href}
      outline={
        <div className="grid gap-m px-s pt-s pb-xl text-step--1">
          {outline.length > 0 && (
            <section>
              <h2 className={idx}>On this page</h2>
              <ol className="mt-xs border-l border-line">
                {outline.map((section, i) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="flex gap-2xs py-1 pl-xs text-muted hover:text-foreground">
                      <span aria-hidden="true" className="font-heading">{String(i + 1).padStart(2, "0")}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {terms.length > 0 && (
            <section>
              <h2 className={idx}>Terms in this lesson</h2>
              <dl className="mt-xs grid gap-xs">
                {terms.map((term) => (
                  <div key={term.slug} className="border border-line bg-background px-xs py-2xs">
                    <dt>
                      <Link href={term.href} className="font-bold text-accent-text underline underline-offset-2">{term.title}</Link>
                    </dt>
                    <dd className="mt-3xs text-step--2 text-muted">{term.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      }
    >
      <article className="mx-auto grid max-w-[55rem] gap-m px-s-l pt-m pb-2xl">
        <header className="grid gap-2xs">
          <p className={idx}>
            Module {String(moduleNumber).padStart(2, "0")} · {module.title}
          </p>
          <h1 className="text-step-3">{page.title}</h1>
          {page.description && <p className="text-step-0 text-muted">{page.description}</p>}
          {lesson && (
            <div className="mt-2xs flex flex-wrap items-center gap-x-s gap-y-2xs">
              {page.duration && <span className={idx}>{page.duration}</span>}
              <MarkComplete file={file} />
            </div>
          )}
        </header>

        <LessonTabs file={file} overview={<Markdown nodes={page.root.children} />} resources={getResources(page.root)} />

        {!lesson && (
          <section aria-labelledby="lessons">
            <h2 id="lessons" className={idx}>Lessons in this module</h2>
            <ol className="mt-xs grid gap-2xs">
              {module.lessons.map((item, i) => (
                <li key={item.file}>
                  <Link href={item.href} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-xs border border-line bg-card px-s py-xs hover:bg-card-secondary">
                    <span className="font-heading text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-bold">{item.title}</span>
                      {item.description && <span className="block text-step--1 text-muted">{item.description}</span>}
                    </span>
                    <span className="text-step--2 text-muted">{item.duration}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(previous || next) && (
          <nav aria-label="Previous and next" className="mt-l flex">
            {previous && (
              <Plate as={Link} href={previous.href} corners="tl" className={cn("grid flex-1 gap-3xs px-s py-xs hover:[--plate-fill:var(--color-card-secondary)]")}>
                <span className={idx}>Previous</span>
                <b className="text-step--1">{previous.title}</b>
              </Plate>
            )}
            {next && (
              <Plate as={Link} href={next.href} corners="br" className={cn("grid flex-1 gap-3xs px-s py-xs text-right hover:[--plate-fill:var(--color-card-secondary)]", previous && "-ml-px")}>
                <span className={idx}>Next</span>
                <b className="text-step--1">{next.title}</b>
              </Plate>
            )}
          </nav>
        )}
      </article>
    </PortalShell>
  );
}

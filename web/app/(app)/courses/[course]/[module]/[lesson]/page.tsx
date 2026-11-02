import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { getCourses } from "@/lib/curriculum";

export const metadata: Metadata = { title: "Lesson" };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().flatMap((course) =>
    course.modules.flatMap((module) => module.lessons.map((lesson) => ({ course: course.slug, module: module.slug, lesson }))),
  );
}

/* The lesson view: its own app bar, then the course rail, the lesson and, on lessons that
   have one, the workbench filling the screen. On phones the rail and the workbench become
   sheets, opened from a bar at the foot. */
export default function Lesson() {
  return (
    <div className="grid h-dvh grid-rows-[auto_1fr_auto] gap-3xs p-3xs md:grid-rows-[auto_1fr]">
      <Placeholder as="header" name="App bar" height={64} note="Back to the course, where you are, progress, and the rail folds" />
      <div className="grid min-h-0 gap-3xs md:grid-cols-[310px_1fr_7px_349px]">
        <div className="hidden min-h-0 grid-rows-[auto_1fr] gap-3xs md:grid">
          <Placeholder name="Course progress" height={75} />
          <Placeholder as="nav" name="Modules and lessons" note="Course rail · folds away from the app bar" />
        </div>
        {/* Focusable so the keyboard can scroll it while nothing inside takes focus */}
        <main tabIndex={0} className="grid min-h-0 content-start gap-3xs overflow-y-auto">
          <h1 className="sr-only">Lesson</h1>
          <Placeholder name="Player" height={260} />
          <Placeholder name="Lesson head" height={110} note="Module, title and the lesson's tabs" />
          <Placeholder name="Lesson tabs" height={383} note="Overview · Transcript · Resources · Notes" />
          <Placeholder as="nav" name="Previous and next" height={81} />
        </main>
        <div className="hidden border-x border-dashed border-trim md:block" aria-hidden="true" title="Grip" />
        <Placeholder
          as="aside"
          name="Workbench"
          className="hidden md:flex"
          note="On lessons that need one: a terminal, a query runner or other hands-on pieces · the grip resizes it, and it folds away"
        />
      </div>
      <Placeholder
        as="nav"
        name="Lesson panels"
        height={56}
        note="Phones only · opens the course rail, or the workbench where there is one, as a sheet"
        className="md:hidden"
      />
    </div>
  );
}

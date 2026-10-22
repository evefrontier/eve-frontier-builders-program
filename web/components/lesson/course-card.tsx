import Link from "next/link";
import { Plate } from "@/components/ui";
import type { Course } from "@/lib/content/load";
import { minutesOf } from "@/lib/minutes";
import { eyebrow } from "./content-page";

/** Counts and total time for a course, as "3 modules · 6 lessons · 45 min". */
export function courseStats(course: Course) {
  const lessons = course.modules.flatMap((m) => m.lessons);
  const minutes = lessons.reduce((sum, l) => sum + minutesOf(l.duration), 0);
  return [
    `${course.modules.length} ${course.modules.length === 1 ? "module" : "modules"}`,
    `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}`,
    minutes ? `${minutes} min` : null,
  ].filter(Boolean).join(" · ");
}

/** A course in a list, linking to its overview. */
export function CourseCard({ course, number }: { course: Course; number?: number }) {
  return (
    <Plate as={Link} href={course.href} corners="tr" className="grid gap-2xs px-s py-s hover:[--plate-fill:var(--color-card-secondary)]">
      <span className={eyebrow}>
        {number !== undefined && `${String(number).padStart(2, "0")} · `}
        {course.pillar !== undefined ? `Pillar ${course.pillar}` : "Course"}
      </span>
      <span className="text-step-1 font-bold">{course.title}</span>
      {course.description && <span className="text-step--1 text-muted">{course.description}</span>}
      <span className="text-step--2 text-muted">{courseStats(course)}</span>
    </Plate>
  );
}

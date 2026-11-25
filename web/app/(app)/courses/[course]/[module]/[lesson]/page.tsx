import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { getCourseOutline, getCourses } from "@/lib/curriculum";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().flatMap((course) =>
    course.modules.flatMap((module) => module.lessons.map((lesson) => ({ course: course.slug, module: module.slug, lesson }))),
  );
}

export async function generateMetadata({ params }: PageProps<"/courses/[course]/[module]/[lesson]">): Promise<Metadata> {
  const { course, module, lesson } = await params;
  const outline = getCourseOutline(course);
  const title = outline.modules.find((entry) => entry.slug === module)?.lessons.find((entry) => entry.slug === lesson)?.title;
  return { title: title ? `${title} · ${outline.title}` : "Lesson" };
}

/* What sits under the lesson's heading. The course's layout supplies the heading and the panes around it. */
export default function Lesson() {
  return (
    <>
      <Placeholder name="Player" height={260} />
      <Placeholder name="Lesson tabs" height={383} note="Overview · Transcript · Resources · Notes" />
      <Placeholder as="nav" name="Previous and next" height={81} />
    </>
  );
}

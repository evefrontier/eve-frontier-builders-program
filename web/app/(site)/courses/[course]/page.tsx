import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { getCourses } from "@/lib/curriculum";

export const metadata: Metadata = { title: "Course" };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().map(({ slug }) => ({ course: slug }));
}

/* Sections from the Course page design, at their heights at 1200 */
export default function Course() {
  return (
    <main className="grid gap-section pt-m pb-section">
      <h1 className="sr-only">Course</h1>
      <div className="wrap">
        <Placeholder name="Hero" height={566} note="Title, summary, four stat panels and the way in">
          <Placeholder as="nav" name="Breadcrumbs" height={43} note="Courses ▪ Pillar ▪ Course" />
        </Placeholder>
      </div>
      <div className="wrap grid items-start gap-s md:grid-cols-[1fr_340px]">
        <div className="grid gap-section">
          <Placeholder name="What you'll learn" height={420} />
          <Placeholder name="Syllabus" height={551} note="Modules that open to their lessons" />
          <Placeholder name="About this course" height={508} />
          <Placeholder name="Course data sheet" height={52} note="Closed by default" />
        </div>
        <div className="grid gap-s md:sticky md:top-[calc(var(--bar-height)+var(--spacing-s))]">
          <Placeholder as="aside" name="Achievement" height={387} note="What finishing earns, and the way in" />
        </div>
      </div>
      <Placeholder name="Plateband" height={358} note="Full bleed" />
      <Placeholder name="Where to go next" height={1069} note="Full bleed · The next courses" />
      <Placeholder
        as="div"
        name="Pinned action bar"
        height={64}
        note="Phones only · the way in, held at the foot of the screen"
        className="fixed inset-x-0 bottom-0 z-(--layer-sticky) bg-background md:hidden"
      />
    </main>
  );
}

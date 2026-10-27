import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { getCourses } from "@/lib/curriculum";

export const metadata: Metadata = { title: "Module" };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().flatMap((course) => course.modules.map((module) => ({ course: course.slug, module: module.slug })));
}

/* Nothing links here: modules open in the course's syllabus. The page is for anyone who trims a
   lesson's address back by one part, so they land on its module rather than a 404. */
export default function Module() {
  return (
    <main className="grid gap-section pt-m pb-section">
      <h1 className="sr-only">Module</h1>
      <div className="wrap grid gap-section">
        <Placeholder name="Hero" height={240} note="Title, summary, lesson count and time">
          <Placeholder as="nav" name="Breadcrumbs" height={43} note="Courses ▪ Course ▪ Module" />
        </Placeholder>
        <Placeholder name="Lessons" height={600} note="Each lesson in order, with its time and whether it's done" />
      </div>
    </main>
  );
}

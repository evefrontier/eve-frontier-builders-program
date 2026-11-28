import type { Metadata } from "next";
import { LessonMarkdown } from "@/components/lesson-view/lesson-markdown";
import { LessonWorkbench } from "@/components/lesson-view/lesson-view";
import { isInventoryExercise } from "@/components/low-code/inventory-exercise";
import { InventoryWorkbenchLoader } from "@/components/low-code/inventory-workbench-loader";
import { Placeholder } from "@/components/placeholder";
import { getCourseOutline, getCourses, getLesson } from "@/lib/curriculum";

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
export default async function Lesson({ params }: PageProps<"/courses/[course]/[module]/[lesson]">) {
  const { lesson } = await params;
  const doc = getLesson(lesson);

  return (
    <>
      <LessonMarkdown source={doc.content} />
      {isInventoryExercise(doc.exercise) && (
        <LessonWorkbench>
          <InventoryWorkbenchLoader exercise={doc.exercise} />
        </LessonWorkbench>
      )}
      <Placeholder as="nav" name="Previous and next" height={81} />
    </>
  );
}

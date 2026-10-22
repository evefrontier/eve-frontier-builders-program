import type { Metadata } from "next";
import { Portal } from "@/components/portal/portal";
import { getCourses, getPage, inCourse, routeOf } from "@/lib/content/load";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({ course: course.slug, module: module.slug, lesson: lesson.slug })),
    ),
  );
}

export async function generateMetadata({ params }: PageProps<"/courses/[course]/[module]/[lesson]">): Promise<Metadata> {
  const { course, module, lesson } = await params;
  const { file } = inCourse(course, module, lesson)!.lesson!;
  const page = getPage(file);
  // A lesson can sit in several modules; search engines get its first address
  return { title: page.title, description: page.description, alternates: { canonical: routeOf(file) } };
}

export default async function Lesson({ params }: PageProps<"/courses/[course]/[module]/[lesson]">) {
  const { course, module, lesson } = await params;
  return <Portal course={course} module={module} lesson={lesson} />;
}

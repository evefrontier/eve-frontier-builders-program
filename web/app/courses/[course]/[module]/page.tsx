import type { Metadata } from "next";
import { Portal } from "@/components/portal/portal";
import { getCourses, inCourse } from "@/lib/content/load";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().flatMap((course) => course.modules.map((module) => ({ course: course.slug, module: module.slug })));
}

export async function generateMetadata({ params }: PageProps<"/courses/[course]/[module]">): Promise<Metadata> {
  const { course, module } = await params;
  const part = inCourse(course, module)!.module;
  // A module can sit in several courses; search engines get its first address
  const first = getCourses().flatMap((c) => c.modules).find((m) => m.slug === part.slug)!;
  return { title: part.title, description: part.description, alternates: { canonical: first.href } };
}

export default async function Module({ params }: PageProps<"/courses/[course]/[module]">) {
  const { course, module } = await params;
  return <Portal course={course} module={module} />;
}

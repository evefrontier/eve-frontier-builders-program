import type { Metadata } from "next";
import { CoursePage } from "@/components/lesson/course-page";
import { getCourses } from "@/lib/content/load";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCourses().map((course) => ({ course: course.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[course]">): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourses().find((c) => c.slug === slug)!;
  return { title: course.title, description: course.description };
}

export default async function Course({ params }: PageProps<"/courses/[course]">) {
  return <CoursePage slug={(await params).course} />;
}

import type { Metadata } from "next";
import { ContentPage } from "@/components/lesson/content-page";
import { CourseCard } from "@/components/lesson/course-card";
import { getCourses, getIndex, renderMarkdown } from "@/lib/content/load";

export function generateMetadata(): Metadata {
  const { title, description } = getIndex().courses;
  return { title, description };
}

export default function Courses() {
  const { title, description, intro } = getIndex().courses;
  return (
    <ContentPage page={{ title, description, root: renderMarkdown(intro ?? "", "index.yaml") }} section="courses">
      <ol className="mt-l grid gap-s sm:grid-cols-2">
        {getCourses().map((course, i) => (
          <li key={course.slug} className="grid">
            <CourseCard course={course} number={i + 1} />
          </li>
        ))}
      </ol>
    </ContentPage>
  );
}

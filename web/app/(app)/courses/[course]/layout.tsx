import { LessonView } from "@/components/lesson-view/lesson-view";
import { getCourseOutline } from "@/lib/curriculum";

/* A course's lessons share one lesson view, so its folds, its widths and the
   contents' scroll hold from one lesson to the next. It fills the screen with
   its own app bar, outside the site's shell. */
export default async function CourseLessons({ params, children }: LayoutProps<"/courses/[course]">) {
  const { course } = await params;
  return <LessonView course={getCourseOutline(course)}>{children}</LessonView>;
}

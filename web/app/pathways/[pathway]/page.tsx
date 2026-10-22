import type { Metadata } from "next";
import { ContentPage, eyebrow } from "@/components/lesson/content-page";
import { CourseCard } from "@/components/lesson/course-card";
import { getIndex, getPathways, renderMarkdown } from "@/lib/content/load";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPathways().map((pathway) => ({ pathway: pathway.slug }));
}

const find = (slug: string) => getPathways().find((pathway) => pathway.slug === slug)!;

export async function generateMetadata({ params }: PageProps<"/pathways/[pathway]">): Promise<Metadata> {
  const pathway = find((await params).pathway);
  return { title: pathway.title, description: pathway.description };
}

export default async function Pathway({ params }: PageProps<"/pathways/[pathway]">) {
  const pathway = find((await params).pathway);
  const page = { title: pathway.title, description: pathway.description, root: renderMarkdown(pathway.intro ?? "", pathway.file) };
  return (
    <ContentPage page={page} parent={{ title: getIndex().pathways.title, href: "/pathways" }} section="pathways">
      <h2 className={`${eyebrow} mt-xl`}>The courses, in order</h2>
      <ol className="mt-xs grid gap-s">
        {pathway.courses.map((course, i) => (
          <li key={course.slug} className="grid">
            <CourseCard course={course} number={i + 1} />
          </li>
        ))}
      </ol>
    </ContentPage>
  );
}

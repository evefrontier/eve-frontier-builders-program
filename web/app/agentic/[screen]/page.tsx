import type { Metadata } from "next";
import { course } from "@/app/agentic/_content";
import { LessonShell, screens } from "../_components/lesson-shell";
import { screenBodies } from "../_screens";

// Every screen is known at build time; anything else is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return screens.map((screen) => ({ screen: screen.slug }));
}

export async function generateMetadata({ params }: PageProps<"/agentic/[screen]">): Promise<Metadata> {
  const { screen } = await params;
  const found = screens.find((item) => item.slug === screen);
  return {
    title: `${found?.title ?? course.title} · ${course.title} · EVE Frontier Builders`,
    description: found?.lead,
  };
}

export default async function ScreenPage({ params }: PageProps<"/agentic/[screen]">) {
  const { screen } = await params;
  const Body = screenBodies[screen];

  return (
    <LessonShell slug={screen}>
      <Body />
    </LessonShell>
  );
}

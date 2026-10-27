import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parse } from "yaml";
import type { SearchEntry } from "./search";

/* The curriculum folder, one level up from web/ */
const root = join(process.cwd(), "..", "curriculum");

function read(file: string, from: string) {
  try {
    return readFileSync(join(root, file), "utf8");
  } catch {
    throw new Error(`${from}: curriculum/${file} doesn't exist`);
  }
}

const yaml = (file: string, from: string) => parse(read(file, from)) ?? {};

const index = () => yaml("index.yaml", "web/lib/curriculum.ts");

export interface Course {
  slug: string;
  title: string;
  description: string;
  modules: { slug: string; title: string; description: string; lessons: string[] }[];
}

/** Every course in index.yaml, with its modules and their lessons, by file name. */
export function getCourses(): Course[] {
  return (index().courses?.list ?? []).map((course: string) => {
    const { title = course, description = "", modules = [] } = yaml(`courses/${course}.yaml`, "curriculum/index.yaml");
    return {
      slug: course,
      title,
      description,
      modules: modules.map((module: string) => {
        const { title = module, description = "", lessons = [] } = yaml(`modules/${module}.yaml`, `curriculum/courses/${course}.yaml`);
        return { slug: module, title, description, lessons };
      }),
    };
  });
}

/** Every pathway in index.yaml, by file name. */
export function getPathways(): string[] {
  return index().pathways?.list ?? [];
}

/* Lessons are filed by pillar and course but found by name alone, so a name can only be used once */
function lessonFiles() {
  const files = new Map<string, string>();
  for (const file of readdirSync(join(root, "lessons"), { recursive: true, encoding: "utf8" })) {
    if (!file.endsWith(".md") || basename(file) === "README.md") continue;
    const name = basename(file, ".md");
    const taken = files.get(name);
    if (taken) throw new Error(`curriculum/lessons/${file}: curriculum/lessons/${taken} already has the name ${name}`);
    files.set(name, file);
  }
  return files;
}

function readLesson(name: string, files: Map<string, string>, from: string) {
  const file = files.get(name);
  if (!file) throw new Error(`${from}: no lesson in curriculum/lessons/ is named ${name}`);
  const text = read(`lessons/${file}`, from);
  const [, front = "", body = text] = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/) ?? [];
  return {
    title: body.match(/^# (.+)$/m)?.[1].trim() ?? name,
    description: String(parse(front)?.description ?? ""),
  };
}

/* A term's name in links: lowercase, spaces as hyphens, punctuation dropped */
const termSlug = (term: string) =>
  term
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

/* Each term in glossary.md is a ### heading, an italic line of topics and other names, then its definition */
function glossaryTerms(): SearchEntry[] {
  return read("glossary.md", "web/lib/curriculum.ts")
    .split(/^### /m)
    .slice(1)
    .map((section): SearchEntry => {
      const [heading, ...rest] = section.split(/\r?\n/);
      const lines = rest.map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
      const meta = lines[0]?.match(/^\*(.+)\*$/)?.[1];
      const [topics = "", also = ""] = meta?.split(" · also: ") ?? [];
      const definition = lines.slice(meta ? 1 : 0).filter((line) => !line.startsWith("[Read the article"));
      return {
        kind: "Term",
        title: heading.trim(),
        description: definition.join(" "),
        href: `/glossary/#${termSlug(heading.trim())}`,
        keywords: [...topics.split(","), ...also.split(",")].map((word) => word.trim()).filter(Boolean),
      };
    });
}

/**
 * Everything search looks through: pathways, then courses with their modules
 * and lessons, then glossary terms. A module or lesson in more than one course
 * is listed once, at its first address.
 */
export function getSearchEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const listed = new Set<string>();
  const add = (slug: string, entry: SearchEntry) => {
    if (listed.has(`${entry.kind}:${slug}`)) return;
    listed.add(`${entry.kind}:${slug}`);
    entries.push(entry);
  };

  for (const pathway of getPathways()) {
    const { title = pathway, description = "", audience } = yaml(`pathways/${pathway}.yaml`, "curriculum/index.yaml");
    add(pathway, { kind: "Pathway", title, description, href: `/pathways/${pathway}/`, keywords: audience ? [audience] : [] });
  }

  const lessons = lessonFiles();
  for (const course of getCourses()) {
    add(course.slug, { kind: "Course", title: course.title, description: course.description, href: `/courses/${course.slug}/` });
    for (const { slug, title, description, lessons: names } of course.modules) {
      // A module opens in its course's syllabus; its own page exists but nothing links to it
      add(slug, { kind: "Module", title, description, href: `/courses/${course.slug}/#${slug}` });
      for (const lesson of names) {
        const content = readLesson(lesson, lessons, `curriculum/modules/${slug}.yaml`);
        add(lesson, { kind: "Lesson", ...content, href: `/courses/${course.slug}/${slug}/${lesson}/` });
      }
    }
  }

  return [...entries, ...glossaryTerms()];
}

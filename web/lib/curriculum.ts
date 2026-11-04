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

export const glossaryTopics = ["Game & economy", "Sui & Move", "Smart Assemblies", "Wallet & identity", "dApps & tools"] as const;

export type GlossaryTopic = (typeof glossaryTopics)[number];

export interface GlossaryTerm {
  slug: string;
  title: string;
  /** Its letter group in glossary.md, `#` for terms that start with a symbol */
  letter: string;
  /** Main topic first */
  topics: GlossaryTopic[];
  aliases: string[];
  definition: string;
  /** From a `Read more in the … Docs →` line */
  docs?: { label: string; url: string };
}

/* A term's name in links: lowercase, spaces as hyphens, punctuation dropped */
const termSlug = (term: string) =>
  term
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const isTopic = (topic: string): topic is GlossaryTopic => (glossaryTopics as readonly string[]).includes(topic);

/**
 * Every term in glossary.md, in file order. The build fails on anything the
 * authoring rules in curriculum/README.md don't allow, so a bad entry never
 * reaches the page or search.
 */
export function getGlossary(): GlossaryTerm[] {
  const file = "curriculum/glossary.md";
  const terms: GlossaryTerm[] = [];

  for (const group of read("glossary.md", "web/lib/curriculum.ts").split(/^## /m).slice(1)) {
    const [letter, ...sections] = group.split(/^### /m).map((part) => part.trim());

    for (const section of sections) {
      const [title, ...paragraphs] = section.split(/\r?\n\s*\r?\n/).map((part) => part.trim());
      const where = `${file}: "${title}"`;
      const first = title[0].toUpperCase();
      if (letter !== (/[A-Z]/.test(first) ? first : "#")) throw new Error(`${where} is under ## ${letter}`);

      const meta = paragraphs.shift()?.match(/^\*(.+)\*$/)?.[1];
      if (!meta) throw new Error(`${where} needs an italic topics line under its heading`);
      const [topicList, ...flags] = meta.split(" · ").map((part) => part.trim());
      const topics = topicList.split(",").map((topic) => topic.trim());
      const notTopic = topics.find((topic) => !isTopic(topic));
      if (notTopic) throw new Error(`${where}: "${notTopic}" isn't one of ${glossaryTopics.join(", ")}`);
      const also = flags.find((flag) => flag.startsWith("also:"));
      const unknown = flags.find((flag) => flag !== also && flag !== "no highlight");
      if (unknown) throw new Error(`${where}: "${unknown}" isn't a topic flag`);

      const definition = paragraphs.shift();
      if (!definition || definition.startsWith("[")) throw new Error(`${where} needs a definition`);

      const slug = termSlug(title);
      let docs: GlossaryTerm["docs"];
      for (const paragraph of paragraphs) {
        const [, text = "", url = ""] = paragraph.match(/^\[(.+)\]\((.+)\)$/) ?? [];
        if (/^Read the article/.test(text)) {
          if (url !== `glossary/${slug}.md`) throw new Error(`${where}: its article has to be glossary/${slug}.md`);
          read(url, where);
        } else if (/^Read more in the .+ Docs/.test(text)) {
          if (!url.startsWith("https://")) throw new Error(`${where}: its docs link has to start with https://`);
          docs = { label: text.replace(/\s*→$/, ""), url };
        } else {
          throw new Error(`${where}: only a Read the article or Read more in the … Docs link can follow the definition`);
        }
      }

      if (terms.some((term) => term.slug === slug)) throw new Error(`${where}: another term already has the slug "${slug}"`);
      terms.push({
        slug,
        title,
        letter,
        topics: topics.filter(isTopic),
        aliases: also ? also.slice(5).split(",").map((alias) => alias.trim()).filter(Boolean) : [],
        // Definitions are plain text; a code span keeps its words and loses its backticks
        definition: definition.replace(/`([^`]*)`/g, "$1"),
        docs,
      });
    }
  }

  return terms;
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

  const terms = getGlossary().map(
    (term): SearchEntry => ({
      kind: "Term",
      title: term.title,
      description: term.definition,
      href: `/glossary/#${term.slug}`,
      keywords: [...term.topics, ...term.aliases],
    }),
  );
  return [...entries, ...terms];
}

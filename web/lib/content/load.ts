import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, posix } from "node:path";
import type { Heading, List, Nodes, Root, RootContent } from "mdast";
import { parse as parseYaml } from "yaml";
import { includeOf, parseMarkdown, tagOf, textOf } from "./parse";
import type { Template, TemplatePart } from "@/lib/template";
import type {
  ByAnswer,
  ConversationBlock,
  Excerpt,
  Exercise,
  GlossaryCard,
  NavGroup,
  NavItem,
  PickBlock,
  PromptBlock,
  Question,
  QuestionBlock,
  WeakStrong,
} from "./types";

/**
 * Three sources, one level up from web/: the GitBook space (glossary and
 * library), the curriculum that joins it up into courses, and the pinned
 * builder docs.
 */
const contentRoot = join(process.cwd(), "..", "content");
const curriculumRoot = join(process.cwd(), "..", "curriculum");
const vendorRoot = join(process.cwd(), "..", "vendor");

interface Page {
  file: string;
  title: string;
  description?: string;
  aliases?: string[];
  duration?: string;
  root: Root;
}

interface VendorSource {
  repo: string;
  commit: string;
  files: Record<string, string>;
}

// next dev doesn't watch these folders, so builds cache for good and dev only
// for a second, long enough to cover one page render
const cache = process.env.NODE_ENV === "production";
const fresh = (at: number) => cache || Date.now() - at < 1000;

/** Lessons come from the curriculum; every other Markdown file from the GitBook space. */
const read = (file: string) =>
  readFileSync(file.startsWith("lessons/") ? join(curriculumRoot, file) : join(contentRoot, file), "utf8");

const readYaml = (file: string) => parseYaml(readFileSync(join(curriculumRoot, file), "utf8")) ?? {};

/* ---------- the GitBook space ---------- */

let nav: { at: number; groups: NavGroup[] } | undefined;

/** The GitBook space's SUMMARY.md: which glossary and library pages exist. */
export function getNav(): NavGroup[] {
  if (nav && fresh(nav.at)) return nav.groups;
  const { root } = parseMarkdown(read("SUMMARY.md"), "SUMMARY.md");
  const groups: NavGroup[] = [{ title: null, items: [] }];
  for (const node of root.children) {
    if (node.type === "heading" && node.depth === 2) groups.push({ title: textOf(node), items: [] });
    if (node.type === "list") groups.at(-1)!.items.push(...navItems(node));
  }
  nav = { at: Date.now(), groups: groups.filter((group) => group.items.length) };
  return nav.groups;
}

function navItems(list: List): NavItem[] {
  return list.children.flatMap((item) => {
    const [first, ...rest] = item.children;
    const link = first?.type === "paragraph" ? first.children.find((child) => child.type === "link") : undefined;
    if (!link) return [];
    return [{
      title: textOf(link),
      file: link.url,
      children: rest.flatMap((child) => (child.type === "list" ? navItems(child) : [])),
    }];
  });
}

const flatten = (items: NavItem[]): NavItem[] => items.flatMap((item) => [item, ...flatten(item.children)]);

/** Every page in the GitBook space. */
const spacePages = () => getNav().flatMap((group) => flatten(group.items));

/* ---------- the glossary: every term on one page, articles beside it ---------- */

/** The topics a term can belong to, as glossary.md spells them. */
export const topics = ["Game & economy", "Sui & Move", "Smart Assemblies", "Wallet & identity", "dApps & tools"] as const;

export interface Term {
  slug: string;
  title: string;
  letter: string;
  topics: string[];
  aliases: string[];
  /** False when the entry says `no highlight`. */
  highlight: boolean;
  definition: string;
  /** The term's concept article, when it has one. */
  article?: string;
  /** The article, or the term's row in the index. */
  href: string;
}

/** GitBook's heading slug: lowercase, spaces to hyphens, punctuation dropped. */
const slugify = (heading: string) =>
  heading.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");

let glossary: { at: number; terms: Term[] } | undefined;

/**
 * Every term in glossary.md, read as strictly as the authoring guide sets
 * out: `### Term`, an italic line of topics (plus `also:` aliases and
 * `no highlight`), the definition, and an optional article link.
 */
export function getGlossary(): Term[] {
  if (glossary && fresh(glossary.at)) return glossary.terms;
  const file = "glossary.md";
  const { root } = parseMarkdown(read(file), file);
  const terms: Term[] = [];
  let letter = "";

  root.children.forEach((node, i) => {
    if (node.type === "heading" && node.depth === 2) letter = textOf(node).trim();
    if (node.type !== "heading" || node.depth !== 3) return;
    const title = textOf(node).trim();
    const where = `${file}: "${title}"`;
    const [line, definition, more] = root.children.slice(i + 1, i + 4);

    const emphasis = line?.type === "paragraph" && line.children.length === 1 && line.children[0].type === "emphasis" ? line.children[0] : undefined;
    if (!emphasis) throw new Error(`${where} needs an italic topics line under its heading`);
    const [topicPart, ...flags] = textOf(emphasis).split(" · ").map((part) => part.trim());
    const termTopics = topicPart.split(",").map((t) => t.trim());
    for (const topic of termTopics) {
      if (!topics.includes(topic as never)) throw new Error(`${where}: "${topic}" isn't one of ${topics.join(", ")}`);
    }
    const also = flags.find((flag) => flag.startsWith("also:"));

    if (definition?.type !== "paragraph" || /^Read the article/.test(textOf(definition))) throw new Error(`${where} needs a definition`);
    const link = more?.type === "paragraph" ? more.children.find((child) => child.type === "link") : undefined;
    const article = link && /^Read the article/.test(textOf(link)) ? posix.normalize(link.url) : undefined;
    if (article && !spacePages().some((item) => item.file === article)) throw new Error(`${where}: article ${article} isn't in SUMMARY.md`);

    const slug = slugify(title);
    if (terms.some((t) => t.slug === slug)) throw new Error(`${where}: another term already has the slug "${slug}"`);
    terms.push({
      slug,
      title,
      letter,
      topics: termTopics,
      aliases: also ? also.slice(5).split(",").map((a) => a.trim()).filter(Boolean) : [],
      highlight: !flags.includes("no highlight"),
      definition: textOf(definition).trim(),
      article,
      href: article ? `/glossary/${slug}` : `/glossary#${slug}`,
    });
  });

  glossary = { at: Date.now(), terms };
  return terms;
}

/** A term by slug, or a build error naming where it was asked for. */
function termOf(slug: string, from: string) {
  const term = getGlossary().find((t) => t.slug === slug);
  if (!term) throw new Error(`${from}: no glossary term "${slug}" in glossary.md`);
  return term;
}

/** The terms with articles, A to Z, for the articles' previous and next links. */
export function getArticles() {
  return getGlossary().filter((t) => t.article).sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
}

/* ---------- the curriculum: courses list modules, modules list lessons ---------- */

export interface Lesson {
  file: string;
  slug: string;
  title: string;
  href: string;
  description?: string;
  duration?: string;
}

export interface Module extends Lesson {
  intro?: string;
  lessons: Lesson[];
}

export interface Course extends Lesson {
  pillar?: number;
  intro?: string;
  modules: Module[];
}

export interface Pathway extends Lesson {
  audience?: string;
  intro?: string;
  /** The answers this pathway suits, such as `{ way: "agentic" }`. */
  for?: Record<string, string>;
  courses: Course[];
}

interface Index {
  courses: { title: string; description?: string; intro?: string; list: string[] };
  pathways: {
    title: string;
    description?: string;
    intro?: string;
    finder?: { title: string; ask: string[]; result: string; none: string };
    list: string[];
  };
}

/** The curriculum's index: the Courses and Pathways pages, and what's on them in order. */
export const getIndex = (): Index => readYaml("index.yaml");

/** A Markdown page's frontmatter and title, without resolving its content. */
function headerOf(file: string) {
  const { frontmatter, root } = parseMarkdown(read(file), file);
  const heading = root.children.find((node) => node.type === "heading" && node.depth === 1);
  return { ...frontmatter, title: heading ? textOf(heading) : posix.basename(file, ".md") };
}

function lessonOf(slug: string, moduleHref: string, from: string): Lesson {
  const file = `lessons/${slug}.md`;
  let header;
  try {
    header = headerOf(file);
  } catch {
    throw new Error(`${from}: no lesson "${slug}" in curriculum/lessons/`);
  }
  return { file, slug, title: header.title, description: header.description, duration: header.duration, href: `${moduleHref}/${slug}` };
}

let courses: { at: number; list: Course[] } | undefined;

/** Every course in the index, composed from the modules and lessons it lists. */
export function getCourses(): Course[] {
  if (courses && fresh(courses.at)) return courses.list;
  const list = getIndex().courses.list.map((slug): Course => {
    const file = `courses/${slug}.yaml`;
    const course = readYaml(file);
    const href = `/courses/${slug}`;
    return {
      file,
      slug,
      title: course.title,
      description: course.description,
      pillar: course.pillar,
      intro: course.intro,
      href,
      modules: (course.modules ?? []).map((moduleSlug: string): Module => {
        const moduleFile = `modules/${moduleSlug}.yaml`;
        let part;
        try {
          part = readYaml(moduleFile);
        } catch {
          throw new Error(`curriculum/${file}: no module "${moduleSlug}" in curriculum/modules/`);
        }
        const moduleHref = `${href}/${moduleSlug}`;
        return {
          file: moduleFile,
          slug: moduleSlug,
          title: part.title,
          description: part.description,
          intro: part.intro,
          href: moduleHref,
          lessons: (part.lessons ?? []).map((lesson: string) => lessonOf(lesson, moduleHref, `curriculum/${moduleFile}`)),
        };
      }),
    };
  });
  courses = { at: Date.now(), list };
  return list;
}

/** A module or lesson in the context of one course, with its neighbours there. */
export function inCourse(courseSlug: string, moduleSlug: string, lessonSlug?: string) {
  const course = getCourses().find((c) => c.slug === courseSlug);
  const part = course?.modules.find((m) => m.slug === moduleSlug);
  const lesson = lessonSlug ? part?.lessons.find((l) => l.slug === lessonSlug) : undefined;
  if (!course || !part || (lessonSlug && !lesson)) return undefined;

  const order: Lesson[] = course.modules.flatMap((m) => [m, ...m.lessons]);
  const here = lesson ?? part;
  const index = order.findIndex((page) => page.href === here.href);
  const lessons = course.modules.flatMap((m) => m.lessons);
  return {
    course,
    module: part,
    lesson,
    number: lessons.findIndex((l) => l.href === here.href) + 1,
    total: lessons.length,
    previous: order[index - 1],
    next: order[index + 1],
  };
}

/** Every pathway in the index, with the courses it lists, in its order. */
export function getPathways(): Pathway[] {
  const all = getCourses();
  return getIndex().pathways.list.map((slug) => {
    const file = `pathways/${slug}.yaml`;
    const pathway = readYaml(file);
    return {
      file,
      slug,
      title: pathway.title,
      description: pathway.description,
      audience: pathway.audience,
      intro: pathway.intro,
      for: pathway.for,
      href: `/pathways/${slug}`,
      courses: (pathway.courses ?? []).map((course: string) => {
        const found = all.find((c) => c.slug === course);
        if (!found) throw new Error(`curriculum/${file}: no course "${course}" in the index`);
        return found;
      }),
    };
  });
}

/* ---------- questions: answers that personalise lessons ---------- */

/** The questions in curriculum/questions.yaml, by id. */
export function getQuestions(): Record<string, Question> {
  const raw = readYaml("questions.yaml") as Record<string, Omit<Question, "id">>;
  return Object.fromEntries(Object.entries(raw).map(([id, question]) => [id, { id, ...question }]));
}

function questionOf(id: unknown, from: string) {
  const question = getQuestions()[String(id)];
  if (!question) throw new Error(`${from}: no question "${id}" in curriculum/questions.yaml`);
  return question;
}

/** Checks a map is keyed by a question's option ids. */
function checkKeys(keys: string[], question: Question, from: string) {
  const ids = question.options.map((option) => option.id);
  for (const key of keys) {
    if (!ids.includes(key)) throw new Error(`${from}: "${key}" isn't an answer to "${question.id}" (${ids.join(", ")})`);
  }
}

/** Compiles `{{question.field|fallback}}` and `[[ … ]]` with every option's value. */
export function compileTemplate(text: string, from: string): Template {
  const parts: TemplatePart[] = [];
  const pattern = /\[\[(.*?)\]\]|\{\{\s*([\w-]+)\.([\w-]+)(?:\|([^}]*))?\s*\}\}/gs;
  let at = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > at) parts.push({ text: text.slice(at, match.index) });
    if (match[1] !== undefined) {
      parts.push({ optional: compileTemplate(match[1], from) });
    } else {
      const question = questionOf(match[2], from);
      const field = match[3];
      if (!question.options.some((option) => option[field] !== undefined)) {
        throw new Error(`${from}: no answer to "${question.id}" has a "${field}"`);
      }
      const values = Object.fromEntries(
        question.options.flatMap((option) => (option[field] !== undefined ? [[option.id, option[field]!]] : [])),
      );
      parts.push({ question: question.id, values, fallback: match[4] });
    }
    at = match.index + match[0].length;
  }
  if (at < text.length) parts.push({ text: text.slice(at) });
  return parts;
}

/* ---------- addresses ---------- */

/**
 * The address of a page on the site. Glossary pages mirror their path. A
 * lesson can sit in several modules, so its address is where it first
 * appears. Library sections and the space's own guide have none.
 */
export function routeOf(file: string): string | undefined {
  if (file === "glossary.md") return "/glossary";
  if (file.startsWith("concepts/")) return getGlossary().find((t) => t.article === file)?.href;
  if (file.startsWith("lessons/")) {
    for (const course of getCourses()) {
      for (const part of course.modules) {
        const lesson = part.lessons.find((l) => l.file === file);
        if (lesson) return lesson.href;
      }
    }
  }
  return undefined;
}

/* ---------- pages ---------- */

const pages = new Map<string, Page>();

/** A lesson or glossary page, with its drop-ins expanded and links resolved. */
export function getPage(file: string): Page {
  const cached = cache && pages.get(file);
  if (cached) return cached;
  const { frontmatter } = parseMarkdown(read(file), file);
  const page = {
    file,
    title: headerOf(file).title,
    description: frontmatter.description,
    aliases: frontmatter.aliases,
    duration: frontmatter.duration,
    root: renderMarkdown(read(file), file),
  };
  pages.set(file, page);
  return page;
}

/**
 * Parses Markdown and resolves it. Curriculum text (lessons, and the intros in
 * the YAML files) names what it links to; GitBook pages link by path.
 */
export function renderMarkdown(source: string, file: string): Root {
  const { root } = parseMarkdown(source, file);
  root.children = expand(root.children, file, new Set([file]));
  dropTitle(root);
  resolve(root, file);
  personalise(root, file);

  const ids = new Map<string, number>();
  visit(root, (node) => {
    if (node.type !== "heading") return;
    const base = textOf(node).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "section";
    const count = ids.get(base) ?? 0;
    ids.set(base, count + 1);
    node.data = { ...node.data, id: count ? `${base}-${count}` : base };
  });
  return root;
}

/** Turns text with `{{…}}` or `[[…]]` into answer text the browser fills in. */
function personalise(root: Root, file: string) {
  visit(root, (node) => {
    if (!("children" in node)) return;
    (node.children as Nodes[]).forEach((child, i) => {
      if (child.type === "text" && /\{\{|\[\[/.test(child.value)) {
        (node.children as Nodes[])[i] = { type: "answerText", template: compileTemplate(child.value, file) };
      }
    });
  });
}

function dropTitle(root: Root) {
  const first = root.children[0];
  if (first?.type === "heading" && first.depth === 1) root.children.shift();
}

/**
 * Turns drop-in blocks into their content: `include` (a library section),
 * `excerpt` (pinned builder docs), `glossary` (a term card) and `exercise`.
 * Included content resolves its links from its own file.
 */
function expand(children: RootContent[], file: string, seen: Set<string>): RootContent[] {
  return children.flatMap((node): RootContent[] => {
    const tagInclude = includeOf(node);
    if (tagInclude) return include(posix.join(posix.dirname(file), tagInclude), file, seen);

    if (node.type === "code" && node.lang === "include") {
      const { file: target } = parseYaml(node.value) ?? {};
      if (typeof target !== "string" || !target.startsWith("library/")) {
        throw new Error(`${file}: an include block needs a file in library/`);
      }
      return include(target, file, seen);
    }
    if (node.type === "code" && node.lang === "excerpt") return [excerpt(node.value, file)];
    const block = (lang: string) => (node.type === "code" && node.lang === lang ? (parseYaml(node.value) ?? {}) : undefined);
    let config;
    if ((config = block("question"))) {
      return [{ type: "question", question: questionOf(config.ask, file) } satisfies QuestionBlock];
    }
    if ((config = block("by-answer"))) {
      const question = questionOf(config.answer, file);
      checkKeys(Object.keys(config.variants ?? {}), question, file);
      if (config.default) checkKeys([config.default], question, file);
      const variants = Object.fromEntries(
        Object.entries(config.variants as Record<string, string>).map(([id, text]) => [id, renderMarkdown(String(text), file).children]),
      );
      return [{ type: "byAnswer", answer: question.id, label: config.label, fallback: config.default, variants } satisfies ByAnswer];
    }
    if ((config = block("prompt"))) {
      return [{ type: "prompt", label: config.label ?? "You might say", copy: Boolean(config.copy), text: compileTemplate(String(config.text), file) } satisfies PromptBlock];
    }
    if ((config = block("pick"))) {
      const question = questionOf(config.by, file);
      checkKeys([...Object.keys(config.pairs ?? {}), config.default, ...(config["strong-first"] ?? [])], question, file);
      return [{
        type: "pick", by: question.id, fallback: config.default, label: config.label ?? "Pick one",
        strongFirst: config["strong-first"] ?? [], right: config.right, wrong: config.wrong, again: config.again, pairs: config.pairs,
      } satisfies PickBlock];
    }
    if ((config = block("conversation"))) {
      const question = questionOf(config.by, file);
      checkKeys([...Object.keys(config.examples ?? {}), config.default], question, file);
      return [{
        type: "conversation", by: question.id, fallback: config.default, frames: config.frames,
        labels: { continue: config.continue, all: config.all, others: config.others, done: config.done }, examples: config.examples,
      } satisfies ConversationBlock];
    }
    if ((config = block("weak-strong"))) {
      return [{ type: "weakStrong", items: config.items } satisfies WeakStrong];
    }
    if (node.type === "code" && node.lang === "glossary") {
      const { term } = parseYaml(node.value) ?? {};
      const found = termOf(String(term), file);
      return [{ type: "glossaryCard", slug: found.slug, title: found.title, description: found.definition, href: found.href } satisfies GlossaryCard];
    }
    if (node.type === "code" && node.lang === "exercise") {
      const { id, ...config } = parseYaml(node.value) ?? {};
      if (typeof id !== "string") throw new Error(`${file}: an exercise block needs an id`);
      return [{ type: "exercise", id, config } satisfies Exercise];
    }
    if (node.type === "gitbook") node.children = expand(node.children, file, seen);
    return [node];
  });
}

function include(target: string, from: string, seen: Set<string>): RootContent[] {
  if (seen.has(target)) throw new Error(`${from}: ${target} includes itself`);
  if (!spacePages().some((item) => item.file === target)) throw new Error(`${from}: ${target} isn't in the GitBook space's SUMMARY.md`);
  const { root } = parseMarkdown(read(target), target);
  root.children = expand(root.children, target, new Set([...seen, target]));
  dropTitle(root);
  resolve(root, target);
  return root.children;
}

let manifest: Record<string, VendorSource> | undefined;

function excerpt(value: string, file: string): Excerpt {
  if (!cache || !manifest) manifest = JSON.parse(readFileSync(join(vendorRoot, "manifest.json"), "utf8")).sources as Record<string, VendorSource>;
  const { source: name, file: path, heading } = parseYaml(value) ?? {};
  const source = manifest[name];
  if (!source) throw new Error(`${file}: no vendored source "${name}"`);
  const hash = source.files[path];
  if (!hash) throw new Error(`${file}: ${name}/${path} isn't in the snapshot; add it with scripts/refresh-vendor.mjs`);

  const data = readFileSync(join(vendorRoot, name, path));
  if (createHash("sha256").update(data).digest("hex") !== hash) {
    throw new Error(`vendor/${name}/${path} doesn't match vendor/manifest.json`);
  }

  const { root } = parseMarkdown(data.toString("utf8"), `vendor/${name}/${path}`);
  const start = root.children.findIndex(
    (node) => node.type === "heading" && textOf(node).trim().toLowerCase() === String(heading).trim().toLowerCase(),
  );
  if (start === -1) throw new Error(`${file}: ${name}/${path} has no heading "${heading}"`);

  const depth = (root.children[start] as Heading).depth;
  const end = root.children.findIndex((node, i) => i > start && node.type === "heading" && node.depth <= depth);
  const children = root.children.slice(start + 1, end === -1 ? undefined : end).filter((node) => node.type !== "thematicBreak");

  // Links inside the excerpt point back at the source, at the pinned commit
  const blob = `https://github.com/${source.repo}/blob/${source.commit}/`;
  const raw = `https://raw.githubusercontent.com/${source.repo}/${source.commit}/`;
  visit({ type: "root", children }, (node) => {
    if ((node.type === "link" || node.type === "image") && !/^[a-z]+:|^#/.test(node.url)) {
      node.url = (node.type === "image" ? raw : blob) + posix.join(posix.dirname(path), node.url);
    }
  });

  return { type: "excerpt", title: textOf(root.children[start]), href: blob + path, children };
}

/**
 * Rewrites links as site addresses, marks glossary links for previews, and
 * rejects broken ones. Curriculum text uses `glossary:name` and `lesson:name`;
 * GitBook pages link to `glossary.md#name` and to articles by relative path.
 */
function resolve(root: Root, file: string) {
  const curriculum = !/^(library|concepts)\/|^glossary\.md$/.test(file);

  visit(root, (node) => {
    if (node.type === "paragraph" && tagOf(node)) {
      throw new Error(`${file}: GitBook blocks can't sit inside lists or quotes: "${textOf(node).trim()}"`);
    }
    if (node.type !== "link") return;
    const [path, hash] = node.url.split("#");

    let term: Term | undefined;
    if (/^glossary:/.test(path)) {
      term = termOf(path.slice(9), file);
    } else if (/^lesson:/.test(path)) {
      const href = routeOf(`lessons/${path.slice(7)}.md`);
      if (!href) throw new Error(`${file}: link to lesson "${path.slice(7)}", which isn't in any course`);
      node.url = href + (hash ? `#${hash}` : "");
      return;
    } else if (/^[a-z]+:|^#|^\//.test(node.url)) {
      return;
    } else if (curriculum) {
      throw new Error(`${file}: link to "${node.url}"; use glossary:name or lesson:name`);
    } else {
      const target = posix.normalize(posix.join(posix.dirname(file), decodeURI(path)));
      if (target === "glossary.md" && hash) term = termOf(hash, file);
      else if (target.startsWith("concepts/")) term = getGlossary().find((t) => t.article === target);
      if (!term) throw new Error(`${file}: link to ${node.url}; GitBook pages can only link to glossary terms and articles`);
    }

    node.url = term.href;
    node.data = { ...node.data, term: term.definition, termSlug: term.slug };
  });
}

function visit(node: Nodes, fn: (node: Nodes) => void) {
  fn(node);
  if ("children" in node) for (const child of node.children) visit(child as Nodes, fn);
}

/* ---------- derived lists ---------- */

/** The lessons that link to or drop in a glossary term, each at its first address. */
export function getBacklinks(slug: string) {
  const lessons = new Map(getCourses().flatMap((c) => c.modules.flatMap((m) => m.lessons)).map((l) => [l.file, l]));
  return [...lessons.values()]
    .filter((lesson) => getTerms(getPage(lesson.file).root).some((t) => t.slug === slug))
    .map((lesson) => ({ ...lesson, href: routeOf(lesson.file)! }));
}

/** The page's second-level headings, for an "On this page" list. */
export function getOutline(root: Root) {
  return root.children.flatMap((node) =>
    node.type === "heading" && node.depth === 2 && node.data?.id ? [{ id: node.data.id, title: textOf(node) }] : [],
  );
}

/** Links a lesson points out to, and the sources it quotes, for its Resources tab. */
export function getResources(root: Root) {
  const resources: { title: string; href: string; kind: string }[] = [];
  const seen = new Set<string>();
  visit(root, (node) => {
    if (node.type === "excerpt" && !seen.has(node.href)) {
      seen.add(node.href);
      resources.push({ title: node.title, href: node.href, kind: "Builder docs" });
    }
    if (node.type === "link" && /^https?:/.test(node.url) && !seen.has(node.url)) {
      seen.add(node.url);
      resources.push({ title: textOf(node), href: node.url, kind: new URL(node.url).hostname.replace(/^www\./, "") });
    }
  });
  return resources;
}

/** Glossary terms a page links to or drops in, in the order they first appear. */
export function getTerms(root: Root): Term[] {
  const slugs = new Set<string>();
  visit(root, (node) => {
    if (node.type === "glossaryCard") slugs.add(node.slug);
    if (node.type === "link" && node.data?.termSlug) slugs.add(node.data.termSlug);
  });
  return [...slugs].map((slug) => termOf(slug, "getTerms"));
}

import type { Nodes, Parent, Root, RootContent } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { parse as parseYaml } from "yaml";
import { hintStyles, type GitbookBlock } from "./types";

export interface Frontmatter {
  description?: string;
  aliases?: string[];
  duration?: string;
  pillar?: number;
  audience?: string;
}

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkFrontmatter);

const containers = new Set(["hint", "tabs", "tab"]);
const tagPattern = /^\{%\s*(end)?([\w-]+)(.*?)%\}$/;

/**
 * Parses a GitBook Markdown page. `{% name %}` blocks become `gitbook` nodes
 * holding their children; `include` and any block the portal can't render
 * are left for the loader to resolve or reject.
 */
export function parseMarkdown(source: string, file: string) {
  const root = processor.parse(isolateTags(source)) as Root;

  let frontmatter: Frontmatter = {};
  if (root.children[0]?.type === "yaml") {
    frontmatter = parseYaml(root.children[0].value) ?? {};
    root.children.shift();
  }

  root.children = group(root.children, file);
  return { frontmatter, root };
}

/**
 * Puts each `{% … %}` tag in its own paragraph, so GitBook's habit of writing
 * a tag on the line next to its content doesn't merge the two. Code, fenced
 * or inline, is left alone.
 */
function isolateTags(source: string) {
  let fence: string | null = null;
  return source
    .split("\n")
    .map((line) => {
      const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
      if (marker && (fence === null || marker.startsWith(fence))) {
        fence = fence === null ? marker : null;
        return line;
      }
      if (fence !== null) return line;
      return line
        .split(/(`[^`]*`)/)
        .map((part, i) => (i % 2 ? part : part.replace(/\{%.*?%\}/g, "\n\n$&\n\n")))
        .join("");
    })
    .join("\n");
}

interface Tag {
  closing: boolean;
  name: string;
  attributes: Record<string, string>;
}

export function tagOf(node: RootContent): Tag | null {
  if (node.type !== "paragraph" || node.children.length !== 1) return null;
  const child = node.children[0];
  if (child.type !== "text") return null;
  const match = child.value.trim().match(tagPattern);
  if (!match) return null;

  const attributes: Record<string, string> = {};
  for (const [, key, value] of match[3].matchAll(/([\w-]+)="([^"]*)"/g)) attributes[key] = value;
  const positional = match[3].trim().match(/^"([^"]*)"/);
  if (positional) attributes.src = positional[1];

  return { closing: Boolean(match[1]), name: match[2], attributes };
}

function group(children: RootContent[], file: string): RootContent[] {
  const top: Parent = { type: "root", children: [] };
  const stack: Parent[] = [top];

  for (const child of children) {
    const tag = tagOf(child);
    const parent = stack.at(-1)!;

    if (!tag) {
      parent.children.push(child);
    } else if (tag.closing) {
      if (parent.type !== "gitbook" || (parent as GitbookBlock).name !== tag.name) {
        throw new Error(`${file}: {% end${tag.name} %} doesn't close an open {% ${tag.name} %}`);
      }
      stack.pop();
    } else if (containers.has(tag.name)) {
      const block = {
        type: "gitbook",
        name: tag.name,
        attributes: tag.attributes,
        children: [],
      } as GitbookBlock;
      validate(block, file);
      parent.children.push(block);
      stack.push(block);
    } else if (tag.name === "include") {
      parent.children.push(child);
    } else {
      throw new Error(`${file}: the portal doesn't support {% ${tag.name} %} blocks yet`);
    }
  }

  if (stack.length > 1) {
    throw new Error(`${file}: {% ${(stack.at(-1) as GitbookBlock).name} %} is never closed`);
  }
  return top.children as RootContent[];
}

function validate(block: GitbookBlock, file: string) {
  const style = block.attributes.style;
  if (block.name === "hint" && !hintStyles.includes(style as never)) {
    throw new Error(`${file}: hint style "${style}" isn't one of ${hintStyles.join(", ")}`);
  }
}

/** The include path of an `{% include "…" %}` paragraph, if that's what it is. */
export function includeOf(node: RootContent) {
  const tag = tagOf(node);
  return tag?.name === "include" ? tag.attributes.src : null;
}

export function textOf(node: Nodes): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node) return node.children.map((child) => textOf(child as Nodes)).join("");
  return "";
}

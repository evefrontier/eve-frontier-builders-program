export type InlineNode =
  | { type: "text"; text: string }
  | { type: "strong"; children: InlineNode[] }
  | { type: "em"; children: InlineNode[] }
  | { type: "code"; text: string }
  | { type: "glossary"; slug: string; label: string }
  | { type: "link"; href: string; label: string; children: InlineNode[] };

export type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; children: InlineNode[] }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "list"; ordered: boolean; items: InlineNode[][] }
  | { type: "callout"; title?: string; blocks: MarkdownBlock[] }
  | { type: "code"; lang?: string; text: string };

function parseInline(input: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const pattern = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;

  for (const match of input.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push({ type: "text", text: input.slice(lastIndex, index) });
    }
    const token = match[0];
    if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, target] = linkMatch;
        if (target.startsWith("glossary:")) {
          nodes.push({ type: "glossary", slug: target.slice("glossary:".length), label });
        } else if (target.startsWith("https://") || (target.startsWith("/") && !target.startsWith("//"))) {
          nodes.push({ type: "link", href: target, label, children: parseInline(label) });
        } else {
          nodes.push({ type: "text", text: label });
        }
      }
    } else if (token.startsWith("`")) {
      nodes.push({ type: "code", text: token.slice(1, -1) });
    } else if (token.startsWith("**")) {
      nodes.push({ type: "strong", children: parseInline(token.slice(2, -2)) });
    } else if (token.startsWith("*")) {
      nodes.push({ type: "em", children: parseInline(token.slice(1, -1)) });
    }
    lastIndex = index + token.length;
  }

  if (lastIndex < input.length) {
    nodes.push({ type: "text", text: input.slice(lastIndex) });
  }
  return nodes;
}

export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    const fence = trimmed.match(/^```(\w*)$/);
    if (fence) {
      const lang = fence[1] || undefined;
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", lang, text: codeLines.join("\n") });
      continue;
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 2 | 3,
        children: parseInline(heading[2].trim()),
      });
      i += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      let title: string | undefined;
      const titleMatch = quoteLines[0]?.match(/^\*\*([^*]+)\*\*$/);
      if (titleMatch) {
        quoteLines.shift();
        title = titleMatch[1];
      }
      blocks.push({ type: "callout", title, blocks: parseMarkdown(quoteLines.join("\n")) });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: InlineNode[][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^[-*]\s+/, "")));
        i += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: InlineNode[][] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^\d+\.\s+/, "")));
        i += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,3}\s+|```|>|[-*]\s+|\d+\.\s+)/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "paragraph", children: parseInline(paraLines.join(" ")) });
  }

  return blocks;
}

import Link from "next/link";
import { Fragment } from "react";
import { Icon, Plate, Tag } from "@/components/ui";
import { tokenizeMove } from "@/components/low-code/move-highlight";
import { MoveTokenSpans } from "@/components/low-code/move-tokens";
import { EXTERNAL } from "@/lib/external";
import { parseMarkdown, type InlineNode, type MarkdownBlock } from "@/lib/markdown";

function renderInline(nodes: InlineNode[]) {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "text":
        return <Fragment key={index}>{node.text}</Fragment>;
      case "strong":
        return <strong key={index} className="font-semibold text-foreground">{renderInline(node.children)}</strong>;
      case "em":
        return <em key={index}>{renderInline(node.children)}</em>;
      case "code":
        return (
          <code key={index} className="border border-line bg-card px-1.5 py-0.5 font-heading text-step--2 text-foreground">
            {node.text}
          </code>
        );
      case "glossary":
        return (
          <Link
            key={index}
            href={`/glossary/#${node.slug}`}
            className="underline decoration-accent-text decoration-dotted underline-offset-4 hover:text-accent-text"
          >
            {node.label}
          </Link>
        );
      case "link":
        return node.href.startsWith("/") ? (
          <Link key={index} href={node.href} className="underline decoration-control-line underline-offset-4 hover:text-accent-text">
            {renderInline(node.children)}
          </Link>
        ) : (
          <a
            key={index}
            href={node.href}
            {...EXTERNAL}
            className="inline-flex items-center gap-1 underline decoration-control-line underline-offset-4 hover:text-accent-text"
          >
            {renderInline(node.children)}
            <Icon name="external" className="size-2.5" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
    }
  });
}

function renderBlocks(blocks: MarkdownBlock[]) {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "heading":
        return block.level === 2 ? (
          <h2 key={index} className="mt-xs font-heading text-step-1 font-bold text-foreground">
            {renderInline(block.children)}
          </h2>
        ) : (
          <h3 key={index} className="mt-2xs font-heading text-step-0 font-bold text-foreground">
            {renderInline(block.children)}
          </h3>
        );
      case "paragraph":
        return (
          <p key={index} className="text-step--1 leading-relaxed text-foreground">
            {renderInline(block.children)}
          </p>
        );
      case "list":
        return block.ordered ? (
          <ol key={index} className="grid list-decimal gap-2xs pl-6 text-step--1 text-foreground">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item)}</li>
            ))}
          </ol>
        ) : (
          <ul key={index} className="grid list-disc gap-2xs pl-6 text-step--1 text-foreground">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      case "callout":
        return (
          <Plate
            key={index}
            as="aside"
            corners="tr-bl"
            cut="sm"
            fill="var(--color-card)"
            keyline="var(--color-control-line)"
            className="grid gap-2xs p-s"
          >
            {block.title && (
              <div>
                <Tag>{block.title}</Tag>
              </div>
            )}
            <div className="grid gap-2xs">{renderBlocks(block.blocks)}</div>
          </Plate>
        );
      case "code": {
        const isMove = block.lang === "move";
        const tokens = isMove ? tokenizeMove(block.text) : null;
        return (
          <pre
            key={index}
            className="overflow-x-auto border border-line bg-card p-s font-heading text-step--2 leading-[1.7] text-foreground"
          >
            <code>
              {tokens
                ? tokens.map((line, lineIndex) => (
                    <span key={lineIndex} className="block">
                      <MoveTokenSpans tokens={line} />
                      {"\n"}
                    </span>
                  ))
                : block.text}
            </code>
          </pre>
        );
      }
    }
  });
}

export function LessonMarkdown({ source }: { source: string }) {
  const blocks = parseMarkdown(source);
  return <article className="grid gap-s">{renderBlocks(blocks)}</article>;
}

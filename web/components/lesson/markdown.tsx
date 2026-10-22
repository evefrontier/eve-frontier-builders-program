import type { ReactNode } from "react";
import Link from "next/link";
import type { RootContent } from "mdast";
import { EXTERNAL, isExternal } from "@/lib/external";
import type { HintStyle } from "@/lib/content/types";
import { CodeBlock } from "./code-block";
import { Excerpt } from "./excerpt";
import { Exercise } from "./exercise";
import { Hint } from "./hint";
import { AnswerText, ByAnswerView, ConversationView, PickView, PromptView, QuestionField } from "./personal";
import { Tabs } from "./tabs";
import { Term } from "./term";

const link = "text-accent-text underline underline-offset-2 hover:decoration-2";

/** Renders a page's resolved Markdown tree with the site's components. */
export function Markdown({ nodes }: { nodes: RootContent[] }) {
  // Top-level sections get a number, as in "01 / Title"; headings inside blocks don't
  const sections = new Map(
    nodes.filter((node) => node.type === "heading" && node.depth === 2).map((node, i) => [node, i + 1]),
  );

  function all(children: RootContent[]) {
    return children.map((child, i) => render(child, i));
  }

  function render(node: RootContent, key: number): ReactNode {
    switch (node.type) {
      case "paragraph":
        return <p key={key} className="mt-s first:mt-0">{all(node.children)}</p>;
      case "heading": {
        const section = sections.get(node);
        if (section) {
          return (
            <div key={key} className="mt-xl first:mt-0">
              <p aria-hidden="true" className="flex items-center gap-xs font-heading text-step--2 tracking-[0.08em] text-muted">
                {String(section).padStart(2, "0")}
                <span className="h-px grow bg-line" />
              </p>
              <h2 id={node.data?.id} className="mt-2xs scroll-mt-l text-step-3">{all(node.children)}</h2>
            </div>
          );
        }
        const Heading = `h${Math.min(Math.max(node.depth, 2), 6)}` as "h3";
        return <Heading key={key} id={node.data?.id} className="mt-l scroll-mt-l first:mt-0">{all(node.children)}</Heading>;
      }
      case "text":
        return node.value;
      case "emphasis":
        return <em key={key}>{all(node.children)}</em>;
      case "strong":
        return <strong key={key}>{all(node.children)}</strong>;
      case "delete":
        return <del key={key}>{all(node.children)}</del>;
      case "inlineCode":
        return <code key={key} className="bg-card px-1 font-mono text-[0.875em]">{node.value}</code>;
      case "break":
        return <br key={key} />;
      case "link":
        if (node.data?.term) {
          return <Term key={key} href={node.url} description={node.data.term}>{all(node.children)}</Term>;
        }
        if (isExternal(node.url)) {
          return <a key={key} href={node.url} {...EXTERNAL} className={link}>{all(node.children)}</a>;
        }
        return <Link key={key} href={node.url} className={link}>{all(node.children)}</Link>;
      case "image":
        // Static export serves images as they are; there's nothing for next/image to optimise
        // eslint-disable-next-line @next/next/no-img-element
        return <img key={key} src={node.url} alt={node.alt ?? ""} className="mt-s max-w-full" />;
      case "list": {
        const List = node.ordered ? "ol" : "ul";
        return (
          <List key={key} start={node.ordered && node.start !== 1 ? (node.start ?? undefined) : undefined} className={`mt-s pl-m ${node.ordered ? "list-decimal" : "list-disc"}`}>
            {all(node.children)}
          </List>
        );
      }
      case "listItem":
        return <li key={key} className="mt-2xs [&>p]:mt-0">{all(node.children)}</li>;
      case "blockquote":
        return <blockquote key={key} className="mt-s border-l-2 border-line pl-s">{all(node.children)}</blockquote>;
      case "code":
        return <CodeBlock key={key} lang={node.meta?.match(/title="([^"]*)"/)?.[1] ?? node.lang} code={node.value} />;
      case "thematicBreak":
        return <hr key={key} className="mt-l border-line" />;
      case "table": {
        const [head, ...body] = node.children;
        return (
          <div key={key} tabIndex={0} className="mt-s overflow-x-auto">
            <table className="w-full border-collapse text-left text-step--1">
              <thead>
                <tr className="border-b border-trim">
                  {head.children.map((cell, i) => <th key={i} scope="col" className="py-2xs pr-s font-bold">{all(cell.children)}</th>)}
                </tr>
              </thead>
              <tbody>
                {body.map((row, r) => (
                  <tr key={r} className="border-b border-line">
                    {row.children.map((cell, i) => <td key={i} className="py-2xs pr-s align-top">{all(cell.children)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "gitbook":
        if (node.name === "hint") {
          return <Hint key={key} style={node.attributes.style as HintStyle}>{all(node.children)}</Hint>;
        }
        if (node.name === "tabs") {
          const tabs = node.children.map((tab) => {
            if (tab.type !== "gitbook" || tab.name !== "tab") throw new Error("A tabs block can only hold tab blocks");
            return { title: tab.attributes.title ?? "", content: all(tab.children) };
          });
          return <Tabs key={key} tabs={tabs} />;
        }
        throw new Error("A tab block has to sit inside a tabs block");
      case "excerpt":
        return <Excerpt key={key} title={node.title} href={node.href}>{all(node.children)}</Excerpt>;
      case "answerText":
        return <AnswerText key={key} template={node.template} />;
      case "question":
        return <QuestionField key={key} question={node.question} />;
      case "byAnswer":
        return (
          <ByAnswerView
            key={key}
            answer={node.answer}
            label={node.label}
            fallback={node.fallback}
            variants={Object.fromEntries(Object.entries(node.variants).map(([id, children]) => [id, <Markdown key={id} nodes={children} />]))}
          />
        );
      case "prompt":
        return <PromptView key={key} label={node.label} copy={node.copy} text={node.text} />;
      case "pick":
        return <PickView key={key} block={node} />;
      case "conversation":
        return <ConversationView key={key} block={node} />;
      case "weakStrong":
        return (
          <ul key={key} role="list" className="mt-s grid gap-s md:grid-cols-2">
            {node.items.map((item) => (
              <li key={item.title} className="grid content-start gap-xs border border-line bg-card p-s">
                <p className="font-bold">{item.title}</p>
                <p className="text-step--1 text-muted"><span className="sr-only">Weaker: </span><span aria-hidden="true">✕ </span>&ldquo;{item.weak}&rdquo;</p>
                <p className="border-l-2 border-accent bg-tint-background px-xs py-2xs text-step--1"><span className="sr-only">Stronger: </span>&ldquo;{item.strong}&rdquo;</p>
              </li>
            ))}
          </ul>
        );
      case "glossaryCard":
        return (
          <aside key={key} aria-label={`Glossary: ${node.title}`} className="mt-s border-l-2 border-accent bg-card px-s py-xs">
            <p className="font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase">Glossary</p>
            <p className="mt-3xs">
              <Link href={node.href} className="font-bold text-accent-text underline underline-offset-2">{node.title}</Link>
              <span className="text-muted"> — {node.description}</span>
            </p>
          </aside>
        );
      case "exercise":
        return <Exercise key={key} id={node.id} config={node.config} />;
      default:
        // Raw HTML and other GitBook-only nodes don't render in the portal
        return null;
    }
  }

  return <>{all(nodes)}</>;
}

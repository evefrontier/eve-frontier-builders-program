"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { Button, Plate } from "@/components/ui";
import { setAnswer, useAnswers } from "@/components/portal/answers";
import { cn } from "@/lib/cn";
import type { ChatMessage, ConversationBlock, PickBlock, Proof, Question } from "@/lib/content/types";
import { fillTemplate, type Template } from "@/lib/template";

const eyebrow = "font-heading text-step--2 font-bold tracking-[0.08em] text-muted uppercase";

/** Text with the reader's answers dropped in. */
export function AnswerText({ template }: { template: Template }) {
  return fillTemplate(template, useAnswers());
}

/** One question as a set of radio cards; the answer is kept on the device. */
export function QuestionField({ question, onAnswer }: { question: Question; onAnswer?: (id: string) => void }) {
  const value = useAnswers()[question.id];
  return (
    <fieldset className="mt-s">
      <legend className="text-step-1 font-bold">{question.label}</legend>
      {question.intro && <p className="mt-3xs text-step--1 text-muted">{question.intro}</p>}
      <div className="mt-xs grid gap-xs sm:grid-cols-2">
        {question.options.map((option) => {
          const checked = value === option.id;
          return (
            <label key={option.id} className="group flex cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={checked}
                onChange={() => {
                  setAnswer(question.id, option.id);
                  onAnswer?.(option.id);
                }}
                className="peer sr-only"
              />
              <Plate
                as="span"
                corners="tr-bl"
                cut="sm"
                className={cn(
                  "grid flex-1 content-start gap-3xs px-s py-xs",
                  "peer-focus-visible:[--plate-keyline-width:2px] peer-focus-visible:[--plate-keyline:var(--color-foreground)]",
                  checked
                    ? "[--plate-fill:var(--color-tint-background)] [--plate-keyline-width:2px] [--plate-keyline:var(--color-accent)]"
                    : "group-hover:[--plate-fill:var(--color-card-secondary)]",
                )}
              >
                <span className="font-bold">{option.label}</span>
                {option.hint && <span className="text-step--1 text-muted">{option.hint}</span>}
              </Plate>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The variant for the reader's answer, or the fallback, or nothing until they've answered. */
export function ByAnswerView({ answer, label, fallback, variants }: {
  answer: string;
  label?: string;
  fallback?: string;
  variants: Record<string, ReactNode>;
}) {
  const id = useAnswers()[answer] ?? fallback;
  const content = id ? variants[id] : undefined;
  return (
    <div aria-live="polite">
      {content && (
        <div className="mt-s border-l-2 border-accent bg-tint-background px-s py-xs text-tint-text [&_strong]:text-foreground">
          {label && <p className={eyebrow}>{label}</p>}
          <div className="text-foreground">{content}</div>
        </div>
      )}
    </div>
  );
}

/** A chat bubble: the reader's messages on the right, the AI's on the left. */
function Bubble({ from, stage, note, label, children, ref }: {
  from: "you" | "ai";
  stage?: string;
  note?: string;
  label?: string;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  const you = from === "you";
  return (
    <div ref={ref} className={cn("grid gap-3xs", you ? "justify-items-end" : "justify-items-start")}>
      <p className="flex items-center gap-2xs text-step--2 text-muted">
        <b className="text-foreground">{label ?? (you ? "You" : "AI")}</b>
        {stage && <span className="border border-line px-1 font-heading tracking-[0.06em] uppercase">{stage}</span>}
      </p>
      <Plate
        corners={you ? "tl" : "tr"}
        cut="sm"
        className={cn("max-w-[40rem] px-s py-xs text-step--1", you && "[--plate-fill:var(--color-tint-background)] [--plate-keyline:var(--color-tint-border)]")}
      >
        {children}
      </Plate>
      {note && <p className={cn("max-w-[40rem] text-step--2 text-muted italic", you && "text-right")}>{note}</p>}
    </div>
  );
}

/** A message the reader might send, filled with their answers, with an optional copy button. */
export function PromptView({ label, copy, text }: { label: string; copy: boolean; text: Template }) {
  const message = fillTemplate(text, useAnswers());
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-s grid gap-2xs">
      <Bubble from="you" label={label}>{message}</Bubble>
      {copy && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(message);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
          <span role="status" className="sr-only">{copied ? "Copied to the clipboard" : ""}</span>
        </div>
      )}
    </div>
  );
}

/** Pick the better of two messages for the reader's answer, then see why. */
export function PickView({ block }: { block: PickBlock }) {
  const id = useAnswers()[block.by] ?? block.fallback;
  return <Picker key={id} block={block} id={id} />;
}

function Picker({ block: { pairs, strongFirst, label, right, wrong, again }, id }: { block: PickBlock; id: string }) {
  const pair = pairs[id];
  // The stronger one goes first for some answers, so position gives nothing away
  const options = strongFirst.includes(id)
    ? [{ text: pair.strong, strong: true }, { text: pair.weak, strong: false }]
    : [{ text: pair.weak, strong: false }, { text: pair.strong, strong: true }];
  const [picked, setPicked] = useState<number>();
  const choice = picked === undefined ? undefined : options[picked];

  return (
    <div className="mt-s">
      <div role="group" aria-label={label} className="grid gap-xs md:grid-cols-2">
        {options.map((option, index) => (
          <Plate
            key={option.text}
            as="button"
            type="button"
            corners="tr-bl"
            cut="sm"
            aria-pressed={picked === index}
            onClick={() => setPicked(index)}
            className={cn(
              "grid cursor-pointer content-start gap-2xs p-s text-left outline-none",
              "focus-visible:[--plate-keyline-width:2px] focus-visible:[--plate-keyline:var(--color-foreground)]",
              picked === index && option.strong && "[--plate-fill:var(--color-tint-background)] [--plate-keyline-width:2px] [--plate-keyline:var(--color-accent)]",
              picked === index && !option.strong && "[--plate-keyline-width:2px] [--plate-keyline:var(--color-control-line)]",
              picked !== index && "hover:[--plate-fill:var(--color-card-secondary)]",
            )}
          >
            <span className={eyebrow}>Message {index === 0 ? "A" : "B"}</span>
            <span className="text-step--1">&ldquo;{option.text}&rdquo;</span>
          </Plate>
        ))}
      </div>
      <div aria-live="polite">
        {choice && (
          <p className="mt-xs border-l-2 border-accent pl-s">
            <b>{choice.strong ? "Good pick. " : "Not quite. "}</b>
            {choice.strong ? right : wrong}
            {!choice.strong && <span className="block text-step--1 text-muted">{again}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

function ProofPanel({ proof, frames }: { proof: Proof; frames: Record<Proof["kind"], string> }) {
  return (
    <figure className="mt-xs border border-line bg-background">
      <figcaption className="flex justify-between gap-s border-b border-line px-xs py-3xs text-step--2 text-muted">
        <span className="font-bold text-foreground">{proof.title}</span>
        <span>{frames[proof.kind]}</span>
      </figcaption>
      <table className="w-full text-left text-step--2">
        <tbody>
          {proof.rows.map((row) => (
            <tr key={row.label} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-xs py-3xs font-normal">{row.label}</th>
              <td className="px-xs py-3xs font-bold">
                {row.pass && <span aria-label="passed" className="mr-1 text-accent-text">✓</span>}
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {proof.footer && <p className="border-t border-line px-xs py-3xs text-step--2 text-muted">{proof.footer}</p>}
    </figure>
  );
}

/** An example conversation for the reader's answer, a message at a time, with the others a click away. */
export function ConversationView({ block }: { block: ConversationBlock }) {
  const answered = useAnswers()[block.by] ?? block.fallback;
  const [picked, setPicked] = useState<string>();
  const shown = picked ?? answered;
  return (
    <div className="mt-s grid gap-s">
      <Stepper key={shown} example={block.examples[shown]} frames={block.frames} labels={block.labels} />
      <p className="flex flex-wrap items-baseline gap-x-s gap-y-2xs text-step--1">
        <span className="text-muted">{block.labels.others}</span>
        {Object.entries(block.examples).filter(([id]) => id !== shown).map(([id, example]) => (
          <button key={id} type="button" onClick={() => setPicked(id)} className="min-h-6 cursor-pointer font-bold text-accent-text underline underline-offset-4 hover:text-foreground">
            {example.title}
          </button>
        ))}
      </p>
    </div>
  );
}

function Stepper({ example, frames, labels }: {
  example: { title: string; messages: ChatMessage[] };
  frames: ConversationBlock["frames"];
  labels: ConversationBlock["labels"];
}) {
  const [count, setCount] = useState(1);
  const latest = useRef<HTMLDivElement>(null);
  const grew = useRef(false);
  const done = count >= example.messages.length;

  // Bring each new message into view, but not on first render
  useEffect(() => {
    if (!grew.current) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    latest.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "nearest" });
  }, [count]);

  const reveal = (to: number) => {
    grew.current = true;
    setCount(to);
  };

  return (
    <Plate corners="tl-br" cut="md" className="grid gap-s p-s [--plate-fill:var(--color-background)]">
      <p className={eyebrow}>Example: {example.title}</p>
      <div className="grid gap-s" aria-live="polite">
        {example.messages.slice(0, count).map((message, index) => (
          <Bubble key={index} ref={index === count - 1 ? latest : undefined} from={message.from} stage={message.stage} note={message.note}>
            {message.text}
            {message.proof && <ProofPanel proof={message.proof} frames={frames} />}
          </Bubble>
        ))}
      </div>
      {done ? (
        <p className="text-step--1 font-bold text-accent-text">{labels.done}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-s">
          <Button variant="secondary" size="sm" onClick={() => reveal(count + 1)}>
            {labels.continue} ({count} of {example.messages.length})
          </Button>
          <button type="button" onClick={() => reveal(example.messages.length)} className="min-h-6 cursor-pointer text-step--1 font-bold text-muted underline underline-offset-4 hover:text-foreground">
            {labels.all}
          </button>
        </div>
      )}
    </Plate>
  );
}

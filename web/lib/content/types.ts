import type { Node, Parent, RootContent } from "mdast";
import type { Template } from "@/lib/template";

export const hintStyles = ["info", "success", "warning", "danger"] as const;
export type HintStyle = (typeof hintStyles)[number];

/** A GitBook `{% name %}` block, grouped with its children. */
export interface GitbookBlock extends Parent {
  type: "gitbook";
  name: "hint" | "tabs" | "tab";
  attributes: Record<string, string>;
  children: RootContent[];
}

/** A section quoted from a vendored source, resolved at build time. */
export interface Excerpt extends Parent {
  type: "excerpt";
  title: string;
  href: string;
  children: RootContent[];
}

/** A glossary term's definition, dropped into a lesson. */
export interface GlossaryCard extends Node {
  type: "glossaryCard";
  slug: string;
  title: string;
  href: string;
  description: string;
}

export interface Exercise extends Node {
  type: "exercise";
  id: string;
  /** The block's other fields, such as the learner-facing text for each node. */
  config: Record<string, unknown>;
}

export interface QuestionOption {
  id: string;
  label: string;
  hint?: string;
  /** Any other text a lesson can drop in, such as `topic` or `phrase`. */
  [field: string]: string | undefined;
}

/** A question from curriculum/questions.yaml. */
export interface Question {
  id: string;
  label: string;
  intro?: string;
  options: QuestionOption[];
}

/** Asks the reader a question and keeps the answer on their device. */
export interface QuestionBlock extends Node {
  type: "question";
  question: Question;
}

/** Different content for each answer to a question. */
export interface ByAnswer extends Node {
  type: "byAnswer";
  answer: string;
  label?: string;
  /** The variant shown before the question's answered, if any. */
  fallback?: string;
  variants: Record<string, RootContent[]>;
}

/** A message the reader might send, personalised, with an optional copy button. */
export interface PromptBlock extends Node {
  type: "prompt";
  label: string;
  copy: boolean;
  text: Template;
}

/** Pick the better of two messages, chosen by an answer. */
export interface PickBlock extends Node {
  type: "pick";
  by: string;
  fallback: string;
  label: string;
  strongFirst: string[];
  right: string;
  wrong: string;
  again: string;
  pairs: Record<string, { weak: string; strong: string }>;
}

export interface Proof {
  kind: "test" | "link" | "phone";
  title: string;
  rows: { label: string; value: string; pass?: boolean }[];
  footer?: string;
}

export interface ChatMessage {
  from: "you" | "ai";
  text: string;
  stage?: string;
  note?: string;
  proof?: Proof;
}

/** An example conversation, stepped through a message at a time, chosen by an answer. */
export interface ConversationBlock extends Node {
  type: "conversation";
  by: string;
  fallback: string;
  frames: Record<Proof["kind"], string>;
  labels: { continue: string; all: string; others: string; done: string };
  examples: Record<string, { title: string; messages: ChatMessage[] }>;
}

/** Pairs of a weaker and a stronger way to ask. */
export interface WeakStrong extends Node {
  type: "weakStrong";
  items: { title: string; weak: string; strong: string }[];
}

/** Text with the reader's answers dropped in. */
export interface AnswerText extends Node {
  type: "answerText";
  template: Template;
}

declare module "mdast" {
  interface RootContentMap {
    gitbook: GitbookBlock;
    excerpt: Excerpt;
    exercise: Exercise;
    glossaryCard: GlossaryCard;
    question: QuestionBlock;
    byAnswer: ByAnswer;
    prompt: PromptBlock;
    pick: PickBlock;
    conversation: ConversationBlock;
    weakStrong: WeakStrong;
    answerText: AnswerText;
  }
  interface PhrasingContentMap {
    answerText: AnswerText;
  }
  interface BlockContentMap {
    gitbook: GitbookBlock;
    excerpt: Excerpt;
    exercise: Exercise;
    glossaryCard: GlossaryCard;
    question: QuestionBlock;
    byAnswer: ByAnswer;
    prompt: PromptBlock;
    pick: PickBlock;
    conversation: ConversationBlock;
    weakStrong: WeakStrong;
  }
  interface HeadingData {
    /** The anchor ID, unique within the page. */
    id?: string;
  }
  interface LinkData {
    /** The linked glossary term's definition, shown as a preview. */
    term?: string;
    /** The linked glossary term's slug. */
    termSlug?: string;
  }
}

export interface NavItem {
  title: string;
  file: string;
  children: NavItem[];
}

export interface NavGroup {
  title: string | null;
  items: NavItem[];
}

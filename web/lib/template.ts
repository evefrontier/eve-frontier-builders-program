/**
 * Personalised text: `{{question.field|fallback}}` drops in a field of the
 * reader's answer, and `[[ … ]]` wraps a part that's left out when an answer
 * inside it is missing. The build compiles a template with every option's
 * value, so the browser only has to look up the reader's answers.
 */

export type Answers = Record<string, string | undefined>;

export type TemplatePart =
  | { text: string }
  | { question: string; values: Record<string, string>; fallback?: string }
  | { optional: TemplatePart[] };

export type Template = TemplatePart[];

/** A template with the reader's answers in, or `null` where a required answer is missing. */
export function fillTemplate(template: Template, answers: Answers): string {
  const fill = (parts: TemplatePart[]): string | null => {
    let out = "";
    for (const part of parts) {
      if ("text" in part) out += part.text;
      else if ("optional" in part) out += fill(part.optional) ?? "";
      else {
        const answer = answers[part.question];
        const value = answer !== undefined ? part.values[answer] : undefined;
        if (value === undefined && part.fallback === undefined) return null;
        out += value ?? part.fallback;
      }
    }
    return out;
  };
  return (fill(template) ?? "").replace(/\s{2,}/g, " ").trim();
}

/** Whether a template has any personalised part. */
export const isPersonal = (template: Template) => template.some((part) => !("text" in part));

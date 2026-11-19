import type { ReactNode } from "react";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Choice } from "@/app/agentic/_content";

type ChoiceGroupProps<Id extends string> = {
  name: string;
  /** Names the group for screen readers; the screen's heading already asks the question. */
  legend: string;
  /** Cards per row on wide screens. */
  columns?: 1 | 2 | 3;
  choices: Choice<Id>[];
  /** A small picture beside each choice. */
  pictures?: Partial<Record<Id, ReactNode>>;
  value?: Id;
  onChange: (id: Id) => void;
};

const wide = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3" } as const;

/** One question, answered by picking a large card. Radios underneath, so arrow keys work. */
export function ChoiceGroup<Id extends string>({
  name,
  legend,
  columns = 2,
  choices,
  pictures,
  value,
  onChange,
}: ChoiceGroupProps<Id>) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className={cn("grid gap-xs", wide[columns])}>
        {choices.map((choice) => (
          <label key={choice.id} className="group block cursor-pointer">
            <input
              type="radio"
              name={name}
              value={choice.id}
              checked={value === choice.id}
              onChange={() => onChange(choice.id)}
              className="peer sr-only"
            />
            <Plate
              as="span"
              corners="tr-bl"
              cut="sm"
              className={cn(
                "grid h-full content-start gap-x-s gap-y-2xs p-s",
                pictures && "grid-cols-[auto_minmax(0,1fr)] items-center",
                "group-hover:[--plate-fill:var(--color-card-secondary)]",
                "peer-checked:[--plate-fill:var(--color-tint-background)] peer-checked:[--plate-keyline:var(--color-accent)]",
                "peer-checked:[--plate-keyline-width:2px]",
                /* Focus thickens the keyline: the plate's clip would cut off an outline */
                "peer-focus-visible:[--plate-keyline:var(--color-foreground)] peer-focus-visible:[--plate-keyline-width:2px]",
              )}
            >
              {pictures?.[choice.id] && <span className="row-span-2 text-foreground">{pictures[choice.id]}</span>}
              <span className="flex items-start gap-2xs font-heading text-step-0 leading-tight font-bold">
                {/* Filled when picked, so the choice doesn't rest on colour alone. Sits on the first line when the label wraps. */}
                <span
                  className="mt-[0.3em] size-2.5 flex-none border border-current group-has-checked:border-accent group-has-checked:bg-accent"
                  aria-hidden="true"
                />
                {choice.label}
              </span>
              <span className="text-step--1 text-muted">{choice.hint}</span>
            </Plate>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

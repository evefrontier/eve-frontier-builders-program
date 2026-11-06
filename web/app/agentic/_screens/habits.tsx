import { Icon, Plate } from "@/components/ui";
import { habits, habitsNote } from "@/app/agentic/_content";

/** Six habits, each a weaker and a stronger way to ask. */
export function Habits() {
  return (
    <>
      <ul className="grid gap-s md:grid-cols-2">
        {habits.map((habit) => (
          <li key={habit.title} className="flex">
            <Plate corners="tr-bl" cut="md" className="grid flex-1 content-start gap-xs p-s">
              <h2 className="text-step-0">{habit.title}</h2>
              <p className="flex gap-2xs text-step--1 text-muted">
                <Icon name="cross" className="mt-[0.45em] size-2.5" aria-label="Weaker" />
                <span>&ldquo;{habit.weak}&rdquo;</span>
              </p>
              <Plate
                corners="tl"
                cut="sm"
                keyline="var(--color-accent)"
                fill="var(--color-tint-background)"
                className="px-xs py-2xs text-step--1"
              >
                <span className="sr-only">Stronger: </span>&ldquo;{habit.strong}&rdquo;
              </Plate>
            </Plate>
          </li>
        ))}
      </ul>
      <p className="text-step--1 text-muted">{habitsNote}</p>
    </>
  );
}

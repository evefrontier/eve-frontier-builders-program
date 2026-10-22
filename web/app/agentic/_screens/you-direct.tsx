import { Fragment } from "react";
import { Plate } from "@/components/ui";
import { team } from "@/app/agentic/_content";
import { PixelArt, type PixelName } from "../_components/pixel-art";

const pictures: PixelName[] = ["person", "agent", "tool"];

/** You direct a team of agents: the idea in one picture. */
export function YouDirect() {
  return (
    <>
      <div className="grid gap-xs md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {team.roles.map((role, index) => (
          <Fragment key={role.name}>
            {index > 0 && (
              <div className="grid place-items-center text-step-2 font-bold text-accent-text" aria-hidden="true">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
              </div>
            )}
            <Plate
              corners="tr-bl"
              cut="md"
              keyline={index === 0 ? "var(--color-accent)" : undefined}
              fill={index === 0 ? "var(--color-tint-background)" : undefined}
              className="grid content-start gap-2xs p-s"
            >
              <PixelArt name={pictures[index]} cell={5} className="mb-2xs" />
              <span className="text-step--2 font-bold tracking-[0.06em] text-accent-text uppercase">{role.role}</span>
              <span className="font-heading text-step-1 leading-tight font-bold">{role.name}</span>
              <p className="text-step--1">{role.body}</p>
            </Plate>
          </Fragment>
        ))}
      </div>

      <ul className="grid gap-xs">
        {team.points.map((point) => (
          <li key={point} className="flex gap-xs text-step-0">
            <span className="mt-[0.55em] size-2 flex-none bg-accent" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>

      <p className="border-l-2 border-accent pl-s text-step--1 text-muted">{team.agent}</p>
    </>
  );
}

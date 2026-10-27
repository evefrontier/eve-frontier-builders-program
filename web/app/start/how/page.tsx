import type { Metadata } from "next";
import Link from "next/link";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import { footer, frontDoor } from "@/app/agentic/_content";
import { cardLink } from "../../agentic/_components/styles";
import { PrototypeBar } from "../../agentic/_components/prototype-bar";
import { YourIdea } from "../../agentic/_components/your-idea";

export const metadata: Metadata = {
  title: "How do you want to build it? · EVE Frontier Builders",
  description: frontDoor.ways.intro,
};

export default function HowPage() {
  return (
    <>
      <PrototypeBar />
      <main className="mx-auto grid w-full max-w-grid flex-1 content-start gap-xl px-s-l py-xl">
        <header className="grid max-w-[48rem] gap-s">
          <span className="text-step--1 font-bold tracking-[0.06em] text-accent-text uppercase">
            {frontDoor.kicker} · {frontDoor.ways.step}
          </span>
          <h1>{frontDoor.ways.title}</h1>
          <YourIdea label={`${frontDoor.ways.yourIdea}:`} change={frontDoor.ways.change} />
          <p className="text-step-1 text-muted">{frontDoor.ways.intro}</p>
        </header>

        <ul className="grid gap-s md:grid-cols-3">
          {frontDoor.ways.list.map((way) => {
            const content = (
              <>
                <span className={cn("text-step--2 font-bold tracking-[0.06em] uppercase", way.href && "text-accent-text")}>
                  {way.label}
                </span>
                <h2 className="text-step-2">{way.title}</h2>
                <p className="text-step--1">{way.body}</p>
                <span className={cn("mt-auto pt-s text-step--1 font-bold", way.href && "text-accent-text")}>
                  {way.href ? `${way.action} →` : way.elsewhere}
                </span>
              </>
            );

            return (
              <li key={way.id} className="flex">
                {way.href ? (
                  <Plate as={Link} href={way.href} corners="tr-bl" cut="md" keyline="var(--color-accent)" className={cardLink}>
                    {content}
                  </Plate>
                ) : (
                  <Plate corners="tr-bl" cut="md" className="flex flex-1 flex-col gap-xs p-m text-muted">
                    {content}
                  </Plate>
                )}
              </li>
            );
          })}
        </ul>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-grid gap-3xs px-s-l py-m text-step--2 text-muted">
          <p>{footer.prototype}</p>
        </div>
      </footer>
    </>
  );
}

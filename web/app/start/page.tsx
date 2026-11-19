import type { Metadata } from "next";
import { footer, frontDoor, ideas } from "@/app/agentic/_content";
import { IdeaLink } from "../agentic/_components/idea-link";
import { cardLink } from "../agentic/_components/styles";
import { PrototypeBar } from "../agentic/_components/prototype-bar";

export const metadata: Metadata = {
  title: "Start building · EVE Frontier Builders",
  description: frontDoor.ideas.intro,
};

export default function StartPage() {
  return (
    <>
      <PrototypeBar />
      <main className="mx-auto grid w-full max-w-grid flex-1 content-start gap-xl px-s-l py-xl">
        <header className="grid max-w-[48rem] gap-s">
          <span className="text-step--1 font-bold tracking-[0.06em] text-accent-text uppercase">
            {frontDoor.kicker} · {frontDoor.ideas.step}
          </span>
          <h1>{frontDoor.ideas.title}</h1>
          <p className="text-step-1 text-muted">{frontDoor.ideas.intro}</p>
        </header>

        <ul className="grid gap-s sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <li key={idea.id} className="flex">
              <IdeaLink id={idea.id} className={cardLink}>
                <h2 className="text-step-1">{idea.title}</h2>
                <p className="text-step--1 text-muted">{idea.body}</p>
                <span className="mt-auto pt-xs text-step--1 font-bold text-accent-text">Pick this →</span>
              </IdeaLink>
            </li>
          ))}
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

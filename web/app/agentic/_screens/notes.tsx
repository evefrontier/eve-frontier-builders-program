import { Plate } from "@/components/ui";
import { notes } from "@/app/agentic/_content";
import { PixelArt } from "../_components/pixel-art";

/** The two files that let a new chat pick up where the last one left off, drawn as files. */
export function Notes() {
  return (
    <>
      <div className="grid gap-s md:grid-cols-2">
        {[notes.rules, notes.log].map((file) => (
          <figure key={file.file} className="grid content-start gap-xs">
            <Plate corners="tr" cut="md" fill="var(--color-background)" className="grid">
              <figcaption className="flex items-center gap-2xs border-b border-line bg-card px-s py-2xs">
                <PixelArt name="file" cell={3} className="text-muted" />
                <code className="text-step--2 font-bold">{file.file}</code>
                <span className="ml-auto text-step--3 tracking-[0.06em] text-muted uppercase">{file.title}</span>
              </figcaption>
              <ol className="grid gap-2xs py-xs font-mono text-step--2">
                {file.lines.map((line, index) => (
                  <li key={line} className="grid grid-cols-[2rem_minmax(0,1fr)] pr-s">
                    <span className="pr-xs text-right text-muted select-none" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </Plate>
            <p className="text-step--1 text-muted">{file.about}</p>
          </figure>
        ))}
      </div>
      <p className="text-step-0">{notes.body}</p>
    </>
  );
}

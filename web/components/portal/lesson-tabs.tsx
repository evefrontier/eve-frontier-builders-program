"use client";

import { useState, type ReactNode } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { Button } from "@/components/ui";
import { EXTERNAL } from "@/lib/external";
import { setDone, useDone } from "./progress";

const tab =
  "relative min-h-11 flex-none cursor-pointer px-s text-step--1 font-bold text-muted outline-offset-[-2px] hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground data-active:text-foreground data-active:shadow-[inset_0_-2px_0_var(--color-accent)]";

/** Marks the lesson complete on this device. */
export function MarkComplete({ file }: { file: string }) {
  const done = useDone().has(file);
  return (
    <Button variant="secondary" size="sm" aria-pressed={done} onClick={() => setDone(file, !done)}>
      {done ? "Completed" : "Mark as complete"}
    </Button>
  );
}

export type LessonTabsProps = {
  file: string;
  overview: ReactNode;
  resources: { title: string; href: string; kind: string }[];
};

/** The lesson's Overview (its content), the Resources it links to, and Notes kept on this device. */
export function LessonTabs({ file, overview, resources }: LessonTabsProps) {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List className="flex overflow-x-auto border-b border-line">
        <Tabs.Tab value="overview" className={tab}>Overview</Tabs.Tab>
        <Tabs.Tab value="resources" className={tab}>Resources{resources.length ? ` (${resources.length})` : ""}</Tabs.Tab>
        <Tabs.Tab value="notes" className={tab}>Notes</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview" keepMounted className="pt-m">{overview}</Tabs.Panel>
      <Tabs.Panel value="resources" className="pt-m">
        {resources.length ? (
          <ul role="list" className="grid gap-2xs">
            {resources.map((resource) => (
              <li key={resource.href}>
                <a
                  href={resource.href}
                  {...EXTERNAL}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-s border border-line bg-background px-s py-xs hover:bg-card"
                >
                  <span>{resource.title}<span className="sr-only"> (opens in a new tab)</span></span>
                  <span className="text-step--2 text-muted">{resource.kind} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">This lesson doesn&rsquo;t link out to anything.</p>
        )}
      </Tabs.Panel>
      <Tabs.Panel value="notes" className="pt-m">
        <Notes file={file} />
      </Tabs.Panel>
    </Tabs.Root>
  );
}

/** Only mounts once its tab is opened, never while prerendering, so it can read storage straight away. */
function Notes({ file }: { file: string }) {
  const key = `learn:notes:${file}`;
  const [saved] = useState(() => {
    try {
      return { text: localStorage.getItem(key) ?? "", available: true };
    } catch {
      return { text: "", available: false };
    }
  });
  const [text, setText] = useState(saved.text);
  const [status, setStatus] = useState(
    !saved.available ? "Notes can't be saved in this browser" : saved.text ? "Saved on this device" : "Not saved yet",
  );

  return (
    <div>
      <label htmlFor="notes" className="sr-only">Your notes for this lesson</label>
      <textarea
        id="notes"
        value={text}
        placeholder="Notes for this lesson. They stay on this device."
        onChange={(event) => {
          setText(event.target.value);
          try {
            localStorage.setItem(key, event.target.value);
            setStatus("Saved on this device");
          } catch {
            setStatus("Notes can't be saved in this browser");
          }
        }}
        className="min-h-40 w-full border border-line bg-background p-s text-step--1 focus:border-foreground focus:outline-none"
      />
      <p role="status" className="mt-2xs text-step--2 text-muted">{status}</p>
    </div>
  );
}

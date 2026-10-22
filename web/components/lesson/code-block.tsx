"use client";

import { useState } from "react";
import { Plate } from "@/components/ui";

/** A code block with its language and a copy button. */
export function CodeBlock({ lang, code }: { lang?: string | null; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Plate corners="tr" cut="sm" className="mt-s">
      <div className="flex min-h-9 items-center justify-between border-b border-line px-xs text-step--2">
        <span className="flex items-center gap-2xs font-bold text-muted">
          <span aria-hidden="true" className="size-1.5 bg-accent" />
          {lang || "text"}
        </span>
        <button type="button" onClick={copy} className="min-h-6 px-2xs font-bold text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre tabIndex={0} className="overflow-x-auto p-s font-mono text-step--1 leading-normal outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-foreground">
        <code>{code}</code>
      </pre>
      <span role="status" className="sr-only">{copied ? "Copied to the clipboard" : ""}</span>
    </Plate>
  );
}

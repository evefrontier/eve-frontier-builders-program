"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

/** Copies text to the clipboard and says so for a moment. */
export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard blocked: the text is still on the page to select by hand
    }
  };

  return (
    <>
      <Button size="sm" variant="secondary" onClick={copy}>
        {copied ? done : label}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to the clipboard" : ""}
      </span>
    </>
  );
}

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PreviewCard } from "@base-ui/react/preview-card";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import styles from "./term.module.css";

export type TermProps = {
  href: string;
  description: string;
  children: ReactNode;
};

/**
 * A link to a glossary term that previews its description on hover and
 * keyboard focus. The preview is a visual extra; the term's page holds the
 * same description for touch and screen reader users.
 */
export function Term({ href, description, children }: TermProps) {
  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger
        delay={300}
        render={<Link href={href} />}
        className="text-accent-text underline decoration-dotted underline-offset-4 hover:decoration-solid data-popup-open:decoration-solid"
      >
        {children}
      </PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner className="z-(--layer-menu)" sideOffset={8}>
          <PreviewCard.Popup render={<Plate cut="sm" className={cn("max-w-80 px-s py-xs text-step--1", styles.popup)} />}>
            {description}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}

import { cn } from "@/lib/cn";

/* Class strings shared by server and client components. They live in a module
   without "use client", so a server page imports them as strings rather than
   client references. */

/* The accent fill for the one main action on a screen, as the course pages in the content pipeline spike draw it */
export const primaryAction = cn(
  "inline-flex min-h-11 items-center gap-xs px-m font-bold text-text-on-accent no-underline outline-none",
  "[--plate-fill:var(--color-accent)] [--plate-keyline:var(--color-accent-keyline)] hover:[--plate-fill:var(--color-accent-hover)]",
  "focus-visible:[--plate-keyline:var(--color-foreground)] focus-visible:[--plate-keyline-width:2px]",
);

/* A whole card that's a link. Focus thickens the keyline: the plate's clip would cut off an outline */
export const cardLink = cn(
  "flex flex-1 flex-col gap-xs p-m text-foreground no-underline outline-none",
  "hover:[--plate-fill:var(--color-tint-background)]",
  "focus-visible:[--plate-keyline:var(--color-foreground)] focus-visible:[--plate-keyline-width:2px]",
);

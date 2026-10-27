import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./placeholder.module.css";

export const placeholderElements = ["section", "div", "aside", "header", "nav", "footer"] as const;

export type PlaceholderProps = {
  /** What the section is, shown as its label */
  name: string;
  /** Its height in the design, in px; it grows if the layout stretches it */
  height?: number;
  /** A short line on what goes in it */
  note?: string;
  as?: (typeof placeholderElements)[number];
  /** Sections that sit inside this one, stacked above its label */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "children">;

/**
 * A labelled stand-in for a section that is designed but not built, so a page
 * can be laid out in its real shape before its content exists. Every element
 * but `div` is named after the section, so it shows as a landmark.
 *
 * @example
 * ```tsx
 * <Placeholder name="Syllabus" height={551} note="Sections that open to their lessons" />
 * ```
 */
export function Placeholder({ name, height, note, as: Tag = "section", className, style, children, ...rest }: PlaceholderProps) {
  return (
    <Tag
      aria-label={Tag === "div" ? undefined : name}
      {...rest}
      className={cn(styles.placeholder, "flex flex-col items-start gap-1 px-4 py-3 text-step--2 text-muted", className)}
      style={{ ...(height && ({ "--placeholder-height": `${height}px` } as CSSProperties)), ...style }}
    >
      {children && <div className="mb-2 grid gap-3xs self-stretch">{children}</div>}
      <span className="font-bold tracking-[0.08em] text-foreground uppercase">{name}</span>
      {note && <span>{note}</span>}
    </Tag>
  );
}

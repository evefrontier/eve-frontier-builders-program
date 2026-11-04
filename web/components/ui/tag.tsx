import type { ComponentPropsWithRef } from "react";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./tag.module.css";

export type TagProps = Omit<ComponentPropsWithRef<"span">, "style">;

/**
 * A label for what something is about, such as a glossary term's topic.
 * Tags never take the accent, which is for actions, and are never
 * interactive.
 *
 * @example
 * ```tsx
 * <Tag>Sui & Move</Tag>
 * ```
 */
export function Tag({ className, children, ...rest }: TagProps) {
  return (
    <Plate
      as="span"
      {...rest}
      className={cn(
        "inline-flex h-6 items-center pr-2 pl-6 text-step--2 leading-none font-bold whitespace-nowrap text-foreground",
        styles.tag,
        className,
      )}
    >
      {children}
    </Plate>
  );
}

"use client";

import type { ComponentPropsWithRef, MouseEvent } from "react";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./button.module.css";

export const buttonVariants = ["primary", "secondary"] as const;
export const buttonSizes = ["xs", "sm", "md", "lg"] as const;

export type ButtonVariant = (typeof buttonVariants)[number];
export type ButtonSize = (typeof buttonSizes)[number];

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
} & Omit<ComponentPropsWithRef<"button">, "style">;

/* Medium is floored at the 44px WCAG 2.5.5 touch target; Small is a dense
  desktop size, and Extra small matches the 28px body-type chips it sits among. */
const sizes: Record<ButtonSize, string> = {
  xs: "min-h-7 px-3 py-1 font-body text-step--2 leading-none",
  sm: "px-s py-2xs text-step--1 leading-none",
  md: "px-m py-xs text-step--1 leading-none min-h-[2.75rem]",
  lg: "px-m py-s text-step-0 leading-none",
};

const variants: Record<ButtonVariant, string> = {
  primary: "text-text-on-accent",
  secondary: "text-foreground",
};

/**
 * An animated action button built on `Plate`.
 *
 * `className` styles the button itself. The focus ring wraps it in a
 * content-sized element, so layout utilities such as `w-full` belong on a
 * parent that stretches its children.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Start building
 * </Button>
 *
 * <Button variant="secondary" loading>
 *   Saving
 * </Button>
 * ```
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  // Disabled wins over loading.
  const busy = loading && !disabled;

  // Keep busy buttons focusable while preventing activation.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    // Render the focus ring outside the clipped button plate.
    <Plate
      as="span"
      className={cn(
        "inline-flex p-1 -m-1 transition-transform duration-[120ms] motion-reduce:transition-none",
        styles.focus,
        (size === "xs" || size === "sm") && styles.sm,
      )}
    >
      <Plate
        as="button"
        {...rest}
        type={type}
        className={cn(
          "group inline-flex flex-1 items-center justify-center font-heading font-bold whitespace-nowrap",
          "cursor-pointer aria-busy:cursor-progress disabled:cursor-not-allowed disabled:text-muted",
          styles.button,
          styles[variant],
          variants[variant],
          sizes[size],
          className,
        )}
        onClick={handleClick}
        disabled={disabled}
        aria-disabled={busy || undefined}
        aria-busy={busy || undefined}
      >
        <span className="inline-block group-aria-busy:opacity-0">{children}</span>
        {busy && (
          <>
            <span className="sr-only">, loading</span>
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[5px]"
              aria-hidden="true"
            >
              <span className={cn("size-[6px] bg-current", styles.cell)} />
              <span className={cn("size-[6px] bg-current", styles.cell)} />
              <span className={cn("size-[6px] bg-current", styles.cell)} />
            </span>
          </>
        )}
      </Plate>
    </Plate>
  );
}

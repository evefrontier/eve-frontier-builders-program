"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type PointerEvent,
} from "react";
import { Icon } from "./icon";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./field.module.css";
import navStyles from "./nav-item.module.css";

export const fieldTypes = ["search", "text", "email", "url", "tel"] as const;

export type FieldType = (typeof fieldTypes)[number];

export type FieldProps = {
  placeholder: string;
  type?: FieldType;
  interlock?: boolean;
  shortcut?: string;
} & Omit<ComponentPropsWithRef<"input">, "style" | "placeholder" | "type">;

const EDITABLE = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

/**
 * A single-line text field with a clear button and an optional keyboard shortcut.
 *
 * `placeholder` is required: the clear button hides via `:placeholder-shown`.
 * `interlock` notches the left edge so the field can sit after a `NavList`.
 * `className` styles the frame; every other prop goes to the input.
 *
 * @example
 * ```tsx
 * <Field
 *   type="search"
 *   name="q"
 *   placeholder="Search"
 *   aria-label="Search"
 *   shortcut="/"
 * />
 * ```
 */
export function Field({
  interlock = false,
  shortcut,
  type = "search",
  disabled,
  className,
  ref,
  ...rest
}: FieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      const cleanup = typeof ref === "function" ? ref(node) : undefined;
      if (ref && typeof ref !== "function") ref.current = node;
      return () => {
        inputRef.current = null;
        if (typeof cleanup === "function") cleanup();
        else if (typeof ref === "function") ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref],
  );

  useEffect(() => {
    if (!shortcut || disabled) return;
    const onKey = (event: KeyboardEvent) => {
      // The first field to claim a key keeps it
      if (event.defaultPrevented || event.key !== shortcut) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.target as Element | null)?.closest?.(EDITABLE)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut, disabled]);

  // Set the value natively so React's onChange still fires
  const clear = () => {
    const input = inputRef.current;
    if (!input) return;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setValue?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  const focusInput = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("button, input")) return;
    event.preventDefault();
    inputRef.current?.focus();
  };

  return (
    <Plate
      className={cn(
        "group flex min-h-[2.75rem] min-w-0 cursor-text items-center gap-2 pr-4 pl-(--field-inset) text-foreground",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:text-muted",
        styles.field,
        interlock && [navStyles.notched, styles.linked],
        className,
      )}
      onPointerDown={focusInput}
    >
      <input
        {...rest}
        ref={setRef}
        type={type}
        disabled={disabled}
        className={cn(
          /* 16px: iOS zooms the page when a focused input is smaller */
          "peer min-w-0 flex-1 appearance-none bg-transparent px-0.5 py-2 text-base outline-none",
          "placeholder:text-muted placeholder:opacity-100 disabled:cursor-not-allowed",
          styles.input,
        )}
        aria-keyshortcuts={disabled ? undefined : shortcut}
      />
      <button
        type="button"
        className={cn(
          "grid size-6 flex-none cursor-pointer place-items-center text-accent-text",
          "peer-placeholder-shown:hidden peer-disabled:hidden",
          "focus-visible:outline-2 focus-visible:outline-foreground",
          "forced-colors:text-[ButtonText] forced-colors:focus-visible:outline-[Highlight]",
        )}
        aria-label="Clear"
        onClick={clear}
      >
        <Icon name="cross" className="size-2.5" />
      </button>
      {shortcut && (
        <kbd
          className={cn(
            /* 18px plus 3px margins fills the clear button's 24px slot, so the two swap in place */
            "m-[3px] grid size-[18px] flex-none place-items-center border border-line",
            "text-step--3 leading-none font-bold text-muted",
            "group-focus-within:hidden peer-disabled:hidden peer-[:not(:placeholder-shown)]:hidden",
          )}
          aria-hidden="true"
        >
          {shortcut === "/" ? <Icon name="forward-slash" className="size-2.5" /> : shortcut}
        </kbd>
      )}
    </Plate>
  );
}

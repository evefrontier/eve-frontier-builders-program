"use client";

import { useId, useState, type ReactNode } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Icon } from "./icon";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./select.module.css";
import buttonStyles from "./button.module.css";
import navStyles from "./nav-item.module.css";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** A word or two after the label, such as why it's disabled */
  note?: string;
};

export type SelectOptionGroup = {
  label: string;
  options: readonly SelectOption[];
};

type RootProps = BaseSelect.Root.Props<string>;

export type SelectProps = {
  label: ReactNode;
  options: readonly SelectOption[] | readonly SelectOptionGroup[];
  placeholder?: string;
  numbered?: boolean;
  grain?: boolean;
  loading?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  className?: string;
} & Pick<RootProps, "value" | "defaultValue" | "onValueChange" | "name" | "required" | "disabled" | "readOnly">;

const grouped = (
  options: SelectProps["options"],
): options is readonly SelectOptionGroup[] => options.length > 0 && "options" in options[0];

/**
 * A dropdown that picks one value from a list, with a rail of pixel squares
 * along the field's foot that lights on hover and while open. The list
 * portals to the body, so a clipped panel can't cut it off, and hangs flush
 * under the field at its width, or over it when there's no room below.
 *
 * `numbered` puts each option's place in the list before it, in the rows and
 * before the value in the field. Use it where the order means something,
 * such as a course's modules; elsewhere the numbers point at nothing.
 * `grain` lays the page's grain over the field's fill, as on other surfaces;
 * turn it off where the field sits on a plain panel.
 * `readOnly` shows a value that can't be changed: the field stays focusable
 * and its list can be opened to see the choices, but nothing can be picked.
 * Prefer it to `disabled` for a locked value, since a disabled field drops
 * out of the tab order. `description` sits under the field, linked to it, to
 * say why. A disabled option can say why on its row with `note`.
 * `error` marks the field invalid and shows the message under it. `loading`
 * shows the button's cells in place of the value and keeps the list shut.
 * `className` styles the wrapper round the label, field and message.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Network"
 *   name="network"
 *   defaultValue="testnet"
 *   options={[
 *     { value: "mainnet", label: "Mainnet" },
 *     { value: "testnet", label: "Testnet" },
 *   ]}
 * />
 * ```
 */
export function Select({
  label,
  options,
  placeholder = "Choose",
  numbered = false,
  grain = true,
  loading = false,
  description,
  error,
  className,
  disabled = false,
  readOnly = false,
  ...rest
}: SelectProps) {
  const flat = grouped(options) ? options.flatMap((group) => group.options) : options;
  const place = (index: number) => (index < 0 ? "--" : String(index + 1).padStart(2, "0"));
  const busy = loading && !disabled;
  const locked = readOnly || busy;
  const descriptionId = useId();
  const messageId = useId();
  const describedBy = [description && descriptionId, error && messageId].filter(Boolean).join(" ") || undefined;

  // A keyboard-opened list highlights the chosen row, so the ring waits for
  // the keyboard rather than showing under the pointer
  const [input, setInput] = useState<"pointer" | "keyboard">("pointer");
  const pointer = () => setInput("pointer");
  const keyboard = () => setInput("keyboard");

  const row = (option: SelectOption) => (
    <BaseSelect.Item
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      // Type-ahead matches the label, not the number before it
      label={option.label}
      render={<Plate />}
      className={cn(
        "group/row flex cursor-pointer items-center gap-3 py-2xs pr-5 pl-4 text-step--1 leading-none font-bold tracking-[0.06em] uppercase select-none",
        "data-disabled:cursor-not-allowed data-disabled:text-muted",
        readOnly && "cursor-default",
        styles.row,
      )}
    >
      <span className={cn(navStyles.lamp, styles.lamp)} aria-hidden="true" />
      {numbered && (
        <span
          className="font-heading text-muted tabular-nums group-data-selected/row:text-accent-text"
          aria-hidden="true"
        >
          {place(flat.indexOf(option))}
        </span>
      )}
      {/* The note sits at the end of the row, and drops under the label when
        there isn't room; a long label wraps rather than hiding behind an ellipsis */}
      <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <BaseSelect.ItemText className="min-w-0 leading-tight">{option.label}</BaseSelect.ItemText>
        {option.note && (
          <span className="text-step--3 leading-tight tracking-[0.08em] text-muted">{option.note}</span>
        )}
      </span>
    </BaseSelect.Item>
  );

  return (
    // Capture phase: Base UI keeps its handlers, and the portalled list's
    // events still pass through here in React's tree
    <div
      className={cn("grid min-w-0 gap-2xs", className)}
      onPointerDownCapture={pointer}
      onKeyDownCapture={keyboard}
    >
      <BaseSelect.Root
        {...rest}
        items={flat}
        disabled={disabled}
        readOnly={locked}
        modal={false}
        onOpenChange={(open, details) => {
          if (open && busy) details.cancel();
        }}
      >
        <BaseSelect.Label className="text-step--2 leading-none font-bold tracking-[0.08em] text-muted uppercase">
          {label}
        </BaseSelect.Label>
        {/* Render the focus ring outside the clipped field */}
        <Plate as="span" corners="tr" cut="sm" className={cn("-m-1 grid p-1", styles.focus)}>
          <BaseSelect.Trigger
            render={<Plate as="button" corners="tr" cut="sm" />}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-busy={busy || undefined}
            className={cn(
              "group flex min-h-[2.75rem] w-full min-w-0 cursor-pointer items-center gap-3 px-4 text-left text-step--1 leading-none text-foreground",
              "aria-busy:cursor-progress data-disabled:cursor-not-allowed data-disabled:text-muted data-readonly:cursor-default",
              styles.trigger,
              !grain && styles.plain,
            )}
          >
            {numbered && (
              <BaseSelect.Value
                aria-hidden="true"
                className="font-heading font-bold text-muted tabular-nums group-data-popup-open:text-accent-text"
              >
                {(value: string | null) => place(flat.findIndex((option) => option.value === value))}
              </BaseSelect.Value>
            )}
            <BaseSelect.Value
              placeholder={placeholder}
              className={cn(
                "min-w-0 flex-1 truncate py-1 font-heading font-bold group-aria-busy:hidden group-data-disabled:font-normal",
                "data-placeholder:font-body data-placeholder:font-normal data-placeholder:text-muted",
              )}
            />
            {busy && (
              <>
                <span className="sr-only">, loading</span>
                <span className="flex flex-1 items-center gap-[5px]" aria-hidden="true">
                  <span className={cn("size-[6px] bg-muted", buttonStyles.cell)} />
                  <span className={cn("size-[6px] bg-muted", buttonStyles.cell)} />
                  <span className={cn("size-[6px] bg-muted", buttonStyles.cell)} />
                </span>
              </>
            )}
            <BaseSelect.Icon
              className={cn(
                "flex text-muted transition-[rotate] duration-200 motion-reduce:transition-none",
                "group-focus-visible:text-accent group-data-popup-open:rotate-180 group-data-popup-open:text-accent",
                "group-data-disabled:text-line",
                !disabled && !locked && "group-hover:text-accent",
              )}
            >
              <Icon name="caret" className="size-2.5" />
            </BaseSelect.Icon>
            <span className={cn("absolute inset-x-px bottom-0 h-0.5 w-auto", navStyles.lamp, styles.rail)} aria-hidden="true" />
          </BaseSelect.Trigger>
        </Plate>
        <BaseSelect.Portal>
          {/* Opening upward, the list stops where the field's cut meets its top
            edge, so its right side drops onto the start of the diagonal */}
          <BaseSelect.Positioner
            alignItemWithTrigger={false}
            align="start"
            className="z-(--layer-menu) w-(--anchor-width) outline-none data-[side=top]:w-[calc(var(--anchor-width)-var(--cut-sm))]"
          >
            <BaseSelect.Popup
              data-input={input}
              onPointerMove={pointer}
              render={<Plate corners="bl" cut="sm" />}
              className={cn("px-px pb-px outline-none data-[side=top]:pt-px data-[side=top]:pb-0", styles.popup)}
            >
              <BaseSelect.List
                render={<Plate corners="bl" />}
                className={cn("max-h-[min(20rem,var(--available-height))] overflow-y-auto overscroll-contain", styles.list)}
              >
                {grouped(options)
                  ? options.map((group) => (
                      <BaseSelect.Group key={group.label} className="border-line not-first:border-t">
                        <BaseSelect.GroupLabel className="px-4 pt-xs pb-3xs text-step--3 leading-none font-bold tracking-[0.14em] text-muted uppercase">
                          {group.label}
                        </BaseSelect.GroupLabel>
                        {group.options.map(row)}
                      </BaseSelect.Group>
                    ))
                  : options.map(row)}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      {description && (
        <p id={descriptionId} className="text-step--2 text-muted">
          {description}
        </p>
      )}
      {error && (
        <p id={messageId} className="flex items-center gap-2 text-step--2 font-bold text-danger">
          <Icon name="bang" className="size-2.5" />
          {error}
        </p>
      )}
    </div>
  );
}

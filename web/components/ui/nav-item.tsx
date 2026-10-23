import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";
import Link from "next/link";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./nav-item.module.css";

type NavItemOwnProps = {
  current?: boolean;
  /** Replaces the lamp, e.g. a menu trigger's caret. */
  indicator?: ReactNode;
  children: ReactNode;
};

export type NavItemProps = NavItemOwnProps &
  (
    | ({ as?: "a" } & Omit<ComponentPropsWithRef<"a">, "style">)
    | ({ as: "button" } & Omit<ComponentPropsWithRef<"button">, "style">)
  );

export type NavListProps = ComponentPropsWithRef<"nav">;

/**
 * An interlocking navigation link for use inside `NavList`. The first item
 * takes the full octagon and each following item notches into the one
 * before it. Links go through Next's `Link`; `as="button"` renders a button,
 * as `Menu` does for its trigger.
 *
 * @example
 * ```tsx
 * <NavList aria-label="Primary">
 *   <NavItem href="/">Learn</NavItem>
 *   <NavItem href="/build" current>Build</NavItem>
 * </NavList>
 * ```
 */
export function NavItem(props: NavItemProps) {
  return (
    <NavSlot>
      <NavItemControl {...props} />
    </NavSlot>
  );
}

/**
 * A `NavList` slot. `Menu` puts its trigger and popup in one, so Base UI's
 * focus guards render inside the list item instead of between items.
 */
export function NavSlot({ className, ...rest }: ComponentPropsWithRef<"li">) {
  return <li {...rest} className={cn(styles.slot, className)} />;
}

/** The item without its slot, for rendering through another component such as a menu trigger. */
export function NavItemControl({ as = "a", current = false, indicator, className, children, ...rest }: NavItemProps) {
  const Component: ElementType = as === "button" ? "button" : "href" in rest && rest.href ? Link : "a";

  return (
    <Plate
      as={Component}
      {...(rest as ComponentPropsWithRef<"a">)}
      className={cn(
        "inline-flex min-h-[2.75rem] items-center gap-2.5 py-3 pr-6 pl-(--nav-inset) whitespace-nowrap",
        as === "button" && "cursor-pointer",
        "font-heading text-step-0 leading-none font-bold tracking-[0.02em] text-foreground",
        styles.item,
        className,
      )}
      aria-current={current ? "page" : undefined}
    >
      {indicator ?? <span className={styles.lamp} aria-hidden="true" />}
      {children}
    </Plate>
  );
}

/** A navigation row that controls the interlock spacing. */
export function NavList({ children, className, ...rest }: NavListProps) {
  return (
    <nav {...rest} className={className}>
      <ul role="list" className={cn("flex items-center", styles.list)}>{children}</ul>
    </nav>
  );
}

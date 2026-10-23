"use client";

import { useEffect, useState, type ComponentProps, type ComponentPropsWithRef, type ElementType, type ReactNode } from "react";
import Link from "next/link";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Icon } from "./icon";
import { NavItemControl, NavSlot } from "./nav-item";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import { EXTERNAL, isExternal } from "@/lib/external";
import styles from "./menu.module.css";
import navStyles from "./nav-item.module.css";

export type MenuProps = {
  label: ReactNode;
  children: ReactNode;
};

/**
 * A navigation dropdown whose trigger is a `NavItem`, so it interlocks with
 * the items around it in a `NavList`. The popup portals to the body, so the
 * row's clip-path can't cut it off, and closes when the window's width
 * changes, since its contents and anchor move.
 *
 * @example
 * ```tsx
 * <NavList aria-label="Primary">
 *   <NavItem href="/pathways">Pathways</NavItem>
 *   <Menu label="More">
 *     <MenuLink href="/docs">Documentation</MenuLink>
 *     <MenuLink href="/glossary" sub>Glossary</MenuLink>
 *     <MenuSeparator />
 *     <MenuLink href="/about">About</MenuLink>
 *   </Menu>
 * </NavList>
 * ```
 */
export function Menu({ label, children }: MenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const width = window.innerWidth;
    // Width only: mobile browsers fire resize when their toolbar or keyboard shows
    const onResize = () => {
      if (window.innerWidth !== width) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  // Opening focuses the first link, which counts as :focus-visible, so the
  // ring is kept for keyboard-driven menus
  const [input, setInput] = useState<"pointer" | "keyboard">("pointer");
  const pointer = () => setInput("pointer");
  const keyboard = () => setInput("keyboard");

  return (
    // Capture phase on the slot: Base UI keeps its handlers, and the
    // portalled popup's events still pass through here in React's tree
    <NavSlot onPointerDownCapture={pointer} onKeyDownCapture={keyboard}>
      <BaseMenu.Root modal={false} open={open} onOpenChange={setOpen}>
        <BaseMenu.Trigger
          render={
            <NavItemControl
              as="button"
              className="group"
              indicator={
                <Icon
                  name="caret"
                  className={cn(
                    "size-2.5 text-muted transition-[rotate] duration-200 motion-reduce:transition-none",
                    "group-hover:text-accent group-focus-visible:text-accent",
                    "group-data-popup-open:rotate-180 group-data-popup-open:text-accent",
                  )}
                />
              }
            >
              {label}
            </NavItemControl>
          }
        />
        <BaseMenu.Portal>
          <BaseMenu.Positioner className="z-(--layer-menu) outline-none" align="start" sideOffset={6}>
            <BaseMenu.Popup
              data-input={input}
              onPointerMove={pointer}
              render={<Plate className={cn("min-w-60 p-px outline-none", styles.popup)} />}
            >
              <Plate className={cn("grid", styles.list)}>{children}</Plate>
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    </NavSlot>
  );
}

export type LinkRowProps = {
  href: string;
  sub?: boolean;
  current?: boolean;
} & Omit<ComponentPropsWithRef<"a">, "href">;

/**
 * A link row as `Menu` draws it, with its lamp, and outside a menu too,
 * such as a list of secondary links. `sub` indents it under the row before,
 * with a branch line when the rows are siblings; `current` marks the page.
 * Links on the site go through Next's `Link`; links off it open in a new tab.
 *
 * @example
 * ```tsx
 * <nav aria-label="Secondary" className="grid">
 *   <LinkRow href="https://docs.evefrontier.com/">Documentation</LinkRow>
 *   <LinkRow href="/glossary" sub>Glossary</LinkRow>
 * </nav>
 * ```
 */
export function LinkRow({ href, sub = false, current = false, className, children, ...rest }: LinkRowProps) {
  const external = isExternal(href);
  const Component: ElementType = external ? "a" : Link;

  return (
    <Plate
      as={Component}
      href={href}
      {...(external && EXTERNAL)}
      {...rest}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 py-2xs pr-5 text-step--1 leading-none font-bold tracking-[0.06em] text-foreground uppercase no-underline",
        sub ? "pl-8" : "pl-4",
        styles.link,
        sub && styles.sub,
        className,
      )}
    >
      {sub && <span className={styles.branch} aria-hidden="true" />}
      <span className={cn(navStyles.lamp, styles.lamp)} aria-hidden="true" />
      {children}
      {external && (
        <>
          <Icon name="external" className="size-2.5 text-muted" />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </Plate>
  );
}

export type MenuLinkProps = {
  href: string;
  sub?: boolean;
  current?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof BaseMenu.LinkItem>, "href" | "className" | "render">;

/** A `LinkRow` inside `Menu`, where Base UI moves the highlight through the rows. */
export function MenuLink({ href, sub, current, className, ...rest }: MenuLinkProps) {
  return (
    <BaseMenu.LinkItem
      // Base UI leaves link items open by default
      closeOnClick
      {...rest}
      render={<LinkRow href={href} sub={sub} current={current} className={className} />}
    />
  );
}

/** A divider between groups of `MenuLink`s. */
export function MenuSeparator() {
  return <BaseMenu.Separator className="border-t border-line" />;
}

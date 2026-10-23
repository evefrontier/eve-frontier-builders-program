"use client";

import { useRef, useState, type ComponentProps, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plate } from "./plate";
import { cn } from "@/lib/cn";
import styles from "./sheet.module.css";

export type SheetProps = {
  label: string;
  header?: ReactNode;
  /** Controls the sheet; leave unset to let it manage itself. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Where focus lands on opening; the close button by default. */
  initialFocus?: ComponentProps<typeof Dialog.Popup>["initialFocus"];
  children: ReactNode;
};

/**
 * A full-width navigation sheet that drops from the top of the screen.
 *
 * Its header row redraws the bar, with the close button where the trigger sat,
 * so the trigger's dots appear to turn into a cross.
 *
 * @example
 * ```tsx
 * <Sheet label="Menu" header={<Brand />}>
 *   <NavLinks />
 * </Sheet>
 * ```
 */
export function Sheet({
  label,
  header,
  open,
  defaultOpen,
  onOpenChange,
  initialFocus,
  children,
}: SheetProps) {
  const actions = useRef<Dialog.Root.Actions>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // The close button fades out over the trigger with its hover or focus look
  // still on, so the trigger wears the same look until the browser's own
  // state has taken over, two frames after the panel is gone
  const [handoff, setHandoff] = useState<string>();

  const onChange = (next: boolean) => {
    const close = closeRef.current;
    if (!next && close) {
      const states = [close.matches(":hover") && "hover", close.matches(":focus-visible") && "focus"];
      setHandoff(states.filter(Boolean).join(" ") || undefined);
    }
    onOpenChange?.(next);
  };

  const settle = (isOpen: boolean) => {
    if (!isOpen) requestAnimationFrame(() => requestAnimationFrame(() => setHandoff(undefined)));
  };

  // Following a link leaves the sheet's page, so it closes behind it
  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("a[href]")) actions.current?.close();
  };

  return (
    <Dialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onChange}
      onOpenChangeComplete={settle}
      actionsRef={actions}
    >
      <Dialog.Trigger render={<DotsButton data-handoff={handoff} />} aria-label={label}>
        <Dots />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={cn("fixed inset-0 z-(--layer-scrim) bg-background/45", styles.backdrop)} />
        <Dialog.Popup
          className={cn("fixed inset-x-0 top-0 z-(--layer-scrim) max-h-dvh overflow-y-auto outline-none", styles.popup)}
          initialFocus={initialFocus ?? closeRef}
        >
          <Dialog.Title className="sr-only">{label}</Dialog.Title>
          <div className="mx-auto flex min-h-(--bar-height) max-w-grid items-center justify-between gap-s bg-background bg-grain px-s-l">
            {header}
            <Dialog.Close ref={closeRef} render={<DotsButton />} aria-label={`Close ${label.toLowerCase()}`}>
              <Dots cross />
            </Dialog.Close>
          </div>
          <div className={cn("grid border-b border-line bg-background", styles.body)}>
            {/* Positioned, so absolutely placed content (a visually hidden label) is clipped
                here rather than stretching the popup's scroll area while the row grows */}
            <div className="relative min-h-0 overflow-hidden">
              <div className="mx-auto grid max-w-grid gap-s px-s-l pt-s pb-m" onClick={closeOnLink}>
                {children}
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* The trigger and the close: the small 12/4 octagon, 44px square */
function DotsButton(props: ComponentProps<"button">) {
  return (
    <Plate
      as="button"
      type="button"
      {...props}
      className={cn("grid size-11 flex-none cursor-pointer place-items-center text-foreground", styles.dots, props.className)}
    />
  );
}

/* 3 × 3 grid → cross with a centre dot, every path radial so no frame has a
   twist: corners run out to the tips, edges collapse into the centre and
   shrink away, and four more cells grow out of the centre onto the inner
   diagonals. [grid x, grid y, cross x, cross y, grid scale, cross scale, delay] */
const MID = 10.5;
const CELLS = [
  [3.5, 3.5, 1.5, 1.5, 1, 1, 100], [17.5, 3.5, 19.5, 1.5, 1, 1, 100],
  [3.5, 17.5, 1.5, 19.5, 1, 1, 100], [17.5, 17.5, 19.5, 19.5, 1, 1, 100],
  [MID, 3.5, MID, MID, 1, 0, 0], [17.5, MID, MID, MID, 1, 0, 0],
  [MID, 17.5, MID, MID, 1, 0, 0], [3.5, MID, MID, MID, 1, 0, 0],
  [MID, MID, MID, MID, 1, 1, 0],
  [MID, MID, 6, 6, 0, 1, 100], [MID, MID, 15, 6, 0, 1, 100],
  [MID, MID, 6, 15, 0, 1, 100], [MID, MID, 15, 15, 0, 1, 100],
].map(([gx, gy, xx, xy, gs, xs, delay]) => ({
  "--gx": `${gx}px`,
  "--gy": `${gy}px`,
  "--xx": `${xx}px`,
  "--xy": `${xy}px`,
  "--gs": gs,
  "--xs": xs,
  transitionDelay: `${delay}ms`,
}) as CSSProperties);

function Dots({ cross = false }: { cross?: boolean }) {
  return (
    <span className={cn("relative size-6", styles.cells, cross && styles.cross)} aria-hidden="true">
      {CELLS.map((style, i) => (
        /* Drawn with a border, which forced colours keep where they would flatten a background */
        <span key={i} className="absolute top-0 left-0 box-border size-[3px] border-[1.5px] border-current" style={style} />
      ))}
    </span>
  );
}

import type { ReactNode } from "react";
import { Plate } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { HintStyle } from "@/lib/content/types";
import styles from "./hint.module.css";

const labels: Record<HintStyle, string> = {
  info: "Note",
  success: "Tip",
  warning: "Warning",
  danger: "Danger",
};

/** GitBook's hint block. The label names the style so it doesn't rest on colour. */
export function Hint({ style, children }: { style: HintStyle; children: ReactNode }) {
  return (
    <Plate as="aside" corners="tl" cut="sm" data-style={style} className={cn("mt-s px-s py-xs", styles.hint)}>
      <p className={cn("font-heading text-step--2 font-bold tracking-[0.04em] uppercase", styles.label)}>
        {labels[style]}
      </p>
      {children}
    </Plate>
  );
}

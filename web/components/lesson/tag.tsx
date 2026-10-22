import type { ReactNode } from "react";
import { Plate } from "@/components/ui";

/** A topic tag. Tags label; they never take the accent, which is for actions. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <Plate as="span" corners="bl" cut="sm" className="inline-flex items-center gap-2xs px-xs py-1 text-step--2 leading-none font-bold">
      <span aria-hidden="true" className="size-1 bg-current opacity-60" />
      {children}
    </Plate>
  );
}

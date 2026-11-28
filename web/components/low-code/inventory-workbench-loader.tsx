"use client";

import dynamic from "next/dynamic";
import type { InventoryWorkbenchProps } from "./inventory-workbench";

/* Lazy-load React Flow + Shiki inside a Client Component so Next.js 16 code-splits
   the ~412 KB workbench bundle away from plain prose lessons. */
const LazyInventoryWorkbench = dynamic(
  () => import("./inventory-workbench").then((mod) => mod.InventoryWorkbench),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-full flex-1 items-center justify-center p-s text-step--2 text-muted">
        Loading workbench…
      </div>
    ),
  },
);

export function InventoryWorkbenchLoader(props: InventoryWorkbenchProps) {
  return <LazyInventoryWorkbench {...props} />;
}

"use client";

import type { ReactNode } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";

export type TabsProps = {
  tabs: { title: string; content: ReactNode }[];
};

/** GitBook's tabs block: a row of tabs over one panel each. */
export function Tabs({ tabs }: TabsProps) {
  return (
    <BaseTabs.Root defaultValue={0} className="mt-s border border-line">
      <BaseTabs.List className="flex flex-wrap border-b border-line">
        {tabs.map((tab, i) => (
          <BaseTabs.Tab
            key={i}
            value={i}
            className="min-h-11 cursor-pointer px-s text-step--1 font-bold text-muted outline-offset-[-2px] hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground data-active:text-foreground data-active:shadow-[inset_0_-2px_0_var(--color-accent)]"
          >
            {tab.title}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {tabs.map((tab, i) => (
        <BaseTabs.Panel key={i} value={i} className="p-s outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-foreground">
          {tab.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}

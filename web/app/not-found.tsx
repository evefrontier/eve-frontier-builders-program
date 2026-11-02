import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = { title: "Page not found" };

/* Unmatched addresses render under the root layout alone, outside the site's group, so this
   brings the shell itself. Next's default would also set the body's colours and a full-screen
   height under the bar. */
export default function NotFound() {
  return (
    <SiteShell>
      <main className="wrap grid gap-section pt-m pb-section">
        <h1 className="sr-only">Page not found</h1>
        <Placeholder name="Hero" height={360} note="Page not found · a line on what happened, a way home and the search field" />
        <Placeholder name="Somewhere to go" height={240} note="Pathways, Courses and the glossary, as links" />
      </main>
    </SiteShell>
  );
}

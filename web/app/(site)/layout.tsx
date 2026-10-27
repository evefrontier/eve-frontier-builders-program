import { SiteShell } from "@/components/site-shell";

/* The site's pages. The lesson view sits outside this group, filling the screen with its own app bar. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}

import type { ReactNode } from "react";
import { navigation } from "@/app/navigation";
import { AlertBand } from "./alert-band";
import { Placeholder } from "./placeholder";
import { TopBar } from "./top-bar";

/**
 * What every site page sits in: the bar and the alert band above, the footer
 * below. Shared by the site's layout and the 404, which renders outside it.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBar {...navigation} />
      <AlertBand />
      {children}
      <Placeholder
        as="footer"
        name="Footer"
        height={520}
        note="Always dark · link columns, a contact panel with Discord and GitHub, the legal row and the wordmark"
        className="mt-auto"
      />
    </>
  );
}

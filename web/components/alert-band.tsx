"use client";

import { usePathname } from "next/navigation";
import { Placeholder } from "./placeholder";

/**
 * The band under the bar on every site page. An alert takes it when there is
 * one; otherwise Home shows the trim there and other pages close it up.
 */
export function AlertBand() {
  const home = usePathname() === "/";

  return (
    <div className="wrap pt-3xs">
      <Placeholder
        name="Alert band"
        height={45}
        note={
          home
            ? "An alert when there is one, otherwise the trim: programme name and rule"
            : "An alert when there is one, otherwise nothing and the band closes up"
        }
      />
    </div>
  );
}

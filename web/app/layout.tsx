import type { Metadata } from "next";
// First, so Tailwind declares the layer order before any component module adds to a layer
import "./globals.css";
import { disketMono, inter } from "./fonts";
import { navigation } from "./navigation";
import { TopBar } from "@/components/top-bar";
import { THEME_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "EVE Frontier Builders",
  description: "A learning and enablement hub for EVE Frontier builders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${disketMono.variable} ${inter.variable} h-full antialiased`}
      // The theme script sets data-theme before React hydrates
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TopBar {...navigation} />
        {children}
      </body>
    </html>
  );
}

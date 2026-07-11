import type { Metadata } from "next";
import { Inter, Source_Serif_4, Oswald } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Self-hosted via next/font: no external font requests at runtime.
// Inter for UI/headings, Source Serif 4 for article body text.
// display "optional": on a slow first load the metric-matched fallback
// is used instead of swapping mid-render, which keeps LCP fast and
// avoids layout shift; repeat visits always get the real fonts.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "optional",
});
// Not preloaded: only article prose uses the serif, so keep its bytes
// off the critical path (Charter/Georgia fallback covers first paint).
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "optional",
  preload: false,
});
// Oswald: bold condensed face used only for the wordmark in the logo.
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-oswald",
  display: "optional",
  preload: false, // wordmark only; Arial Narrow fallback is close enough
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} ${oswald.variable}`}
    >
      <body className="min-h-screen bg-white font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <Header />
        {/* Pages set their own width: magazine pages go wide (max-w-6xl),
            article bodies keep the narrow reading measure (max-w-2xl). */}
        <main className="pb-20">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

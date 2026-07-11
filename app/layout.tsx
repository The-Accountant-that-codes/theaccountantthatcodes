import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
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
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "optional",
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
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-white font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <header className="mx-auto w-full max-w-2xl px-5 py-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {SITE_NAME}
          </Link>
        </header>
        <main className="mx-auto w-full max-w-2xl px-5 pb-16">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

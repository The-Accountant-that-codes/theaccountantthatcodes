import Link from "next/link";
import { Logo } from "@/components/Logo";

// Minimal Boulevard-style top nav: logo left, a few links + the
// subscribe action right. No search icon -- search is deliberately out
// of scope for this site (see CLAUDE.md), and there's no members system,
// so "Subscribe" takes the place of "Sign in".
export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:py-8">
      <Link href="/" aria-label="The Accountant That Codes — home">
        <Logo />
      </Link>
      <nav className="flex items-center gap-5 text-sm font-medium sm:gap-7">
        <Link
          href="/about/"
          className="text-neutral-600 transition-colors hover:text-brand dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          About
        </Link>
        <Link
          href="/#subscribe"
          className="rounded-full bg-brand px-4 py-2 text-white transition-opacity hover:opacity-85 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Subscribe
        </Link>
      </nav>
    </header>
  );
}

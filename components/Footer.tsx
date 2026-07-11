import { SITE_NAME, SOCIAL_LINKS } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-2xl border-t border-neutral-200 px-5 py-8 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      <div className="flex items-center justify-between">
        <span>
          © {new Date().getFullYear()} {SITE_NAME}
        </span>
        <nav className="flex gap-4">
          <a
            href={SOCIAL_LINKS.linkedin}
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            LinkedIn
          </a>
          <a
            href={SOCIAL_LINKS.github}
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}

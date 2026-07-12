import type { Metadata } from "next";
import { SOCIAL_LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Accountant That Codes is an independent publication by Francisco Meyo — coding, automation, and AI for accountants and finance professionals.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pt-10">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        About
      </h1>
      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        <p>
          The Accountant That Codes is an independent publication launched in
          January 2026 by{" "}
          <a href={SOCIAL_LINKS.linkedin}>Francisco Meyo</a>.
        </p>
        <p>
          Throughout my career in accounting and finance, I was always an
          automation enthusiast&mdash;but everything changed once I started
          coding. Coding unlocked a new way to solve problems, automate work,
          and build tools that go far beyond spreadsheets.
        </p>
        <p>
          We live in a time where coding is no longer just for engineers.
          With modern tools and AI-assisted development, it has never been
          easier for accountants and finance professionals to learn,
          experiment, and put code into practice.
        </p>
        <p>
          This blog is a place where I share what I&rsquo;m learning, with
          the hope that others in the profession can take shortcuts from my
          experience and build better, more scalable ways to work.
        </p>
      </div>
    </div>
  );
}

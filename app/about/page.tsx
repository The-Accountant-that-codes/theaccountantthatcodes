import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

// Placeholder — Francisco supplies the real copy later.
export default function AboutPage() {
  return (
    <div className="prose prose-neutral dark:prose-invert">
      <h1>About</h1>
      <p>
        Python, APIs, and AI automation for finance teams — by a CPA who
        codes. Full about page coming soon.
      </p>
    </div>
  );
}

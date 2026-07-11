"use client";

import { useState } from "react";
import { GridCard, type CardPost } from "./cards";

const PAGE_SIZE = 6;

// Boulevard-style "Latest posts": a pill filter bar (All + one pill per
// tag) over a reverse-chronological grid, with Load more instead of
// pagination. Runs entirely client-side — with a 10-post corpus the
// data is small enough to ship with the page.
export default function LatestPosts({
  posts,
  tags,
}: {
  posts: CardPost[];
  tags: string[];
}) {
  // active is the lowercased tag, or null for "All".
  const [active, setActive] = useState<string | null>(null);
  const [count, setCount] = useState(PAGE_SIZE);

  const filtered = active
    ? posts.filter((p) => p.tags.some((t) => t.toLowerCase() === active))
    : posts;
  const visible = filtered.slice(0, count);

  function selectTag(tag: string | null) {
    setActive(tag);
    setCount(PAGE_SIZE); // reset paging when the filter changes
  }

  const pillBase =
    "rounded-full px-4 py-2 text-sm font-medium transition-colors";
  const pillActive =
    "bg-brand text-white dark:bg-neutral-100 dark:text-neutral-900";
  const pillIdle =
    "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800";

  return (
    <section aria-labelledby="latest-heading">
      <h2
        id="latest-heading"
        className="text-2xl font-extrabold tracking-tight sm:text-3xl"
      >
        Latest posts
      </h2>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter posts by tag">
        <button
          type="button"
          onClick={() => selectTag(null)}
          aria-pressed={active === null}
          className={`${pillBase} ${active === null ? pillActive : pillIdle}`}
        >
          All
        </button>
        {tags.map((tag) => {
          const key = tag.toLowerCase();
          return (
            <button
              key={key}
              type="button"
              onClick={() => selectTag(key)}
              aria-pressed={active === key}
              className={`${pillBase} ${active === key ? pillActive : pillIdle}`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => (
          <GridCard key={post.slug} post={post} />
        ))}
      </div>

      {filtered.length > count && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setCount((c) => c + PAGE_SIZE)}
            className="rounded-full bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            Load more
          </button>
        </div>
      )}
    </section>
  );
}

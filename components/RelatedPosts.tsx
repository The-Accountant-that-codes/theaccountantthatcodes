import Link from "next/link";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export default function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <aside className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
        Related posts
      </h2>
      <ul className="mt-4 space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/${post.slug}/`} className="group block">
              <span className="font-medium group-hover:underline">
                {post.title}
              </span>
              <span className="block text-sm text-neutral-600 dark:text-neutral-400">
                {formatDate(post.date)} · {post.readingTimeMinutes} min read
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

import type { Post } from "@/lib/posts";
import { DEFAULT_AUTHOR } from "@/lib/site";
import { formatDate } from "@/lib/format";

// Renders the author from frontmatter when present; posts without an
// `author` field belong to Francisco (the site default).
export default function Byline({ post }: { post: Post }) {
  const author = post.author ?? DEFAULT_AUTHOR;
  return (
    <p className="text-sm text-neutral-500 dark:text-neutral-400">
      {author.url ? (
        <a href={author.url} className="font-medium text-neutral-700 hover:underline dark:text-neutral-300">
          {author.name}
        </a>
      ) : (
        <span className="font-medium text-neutral-700 dark:text-neutral-300">
          {author.name}
        </span>
      )}
      {author.title && <> · {author.title}</>}
      {" · "}
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      {" · "}
      {post.readingTimeMinutes} min read
    </p>
  );
}

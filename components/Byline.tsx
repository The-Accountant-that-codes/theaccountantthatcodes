import type { Post } from "@/lib/posts";
import { DEFAULT_AUTHOR } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { Avatar } from "@/components/cards";

// Renders the author from frontmatter when present; posts without an
// `author` field belong to Francisco (the site default).
export default function Byline({ post }: { post: Post }) {
  const author = post.author ?? DEFAULT_AUTHOR;
  return (
    <p className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
      <Avatar author={author} className="h-9 w-9 text-xs" />
      <span>
        {author.url ? (
          <a
            href={author.url}
            className="font-medium text-neutral-700 hover:underline dark:text-neutral-300"
          >
            {author.name}
          </a>
        ) : (
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {author.name}
          </span>
        )}
        {author.title && <> · {author.title}</>}
        <span className="block text-neutral-500 dark:text-neutral-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {" · "}
          {post.readingTimeMinutes} min read
        </span>
      </span>
    </p>
  );
}

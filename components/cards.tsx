import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";
import { DEFAULT_AUTHOR } from "@/lib/site";
import { formatDate } from "@/lib/format";

// Everything a card needs, minus the MDX body — cards also render inside
// client components (the filterable Latest section), and passing full
// Post objects there would ship every article's source to the browser.
export type CardPost = Omit<Post, "body">;

export function TagPills({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${tag.toLowerCase()}/`}
            className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// No author photo exists in the Ghost export, so avatars render as an
// initials disc in the brand color. Swap for an <Image> when Francisco
// adds a headshot.
export function InitialsAvatar({
  name,
  className = "h-7 w-7 text-[11px]",
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-brand font-semibold text-white dark:bg-neutral-200 dark:text-neutral-900 ${className}`}
    >
      {initials}
    </span>
  );
}

// Headshot when the author has one on disk, initials disc otherwise.
export function Avatar({
  author,
  className = "h-7 w-7 text-[11px]",
}: {
  author: { name: string; image?: string };
  className?: string;
}) {
  if (author.image) {
    return (
      <Image
        src={author.image}
        alt=""
        width={56}
        height={56}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  return <InitialsAvatar name={author.name} className={className} />;
}

export function AuthorMeta({ post }: { post: CardPost }) {
  const author = post.author ?? DEFAULT_AUTHOR;
  return (
    <p className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
      <Avatar author={author} />
      <span className="font-medium text-neutral-800 dark:text-neutral-200">
        {author.name}
      </span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
    </p>
  );
}

// Large featured card: tall image, pills, big headline, excerpt, byline.
export function FeaturedCard({ post }: { post: CardPost }) {
  return (
    <article className="group flex flex-col gap-4">
      {post.featureImage && (
        <Link href={`/${post.slug}/`} tabIndex={-1} aria-hidden>
          <Image
            src={post.featureImage}
            alt=""
            width={1200}
            height={900}
            priority
            fetchPriority="high"
            quality={60}
            sizes="(max-width: 1024px) 92vw, 536px"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </Link>
      )}
      <TagPills tags={post.tags} />
      <Link href={`/${post.slug}/`}>
        <h2 className="text-3xl font-extrabold tracking-tight group-hover:underline sm:text-4xl">
          {post.title}
        </h2>
      </Link>
      <p className="line-clamp-2 text-neutral-600 dark:text-neutral-400">
        {post.excerpt}
      </p>
      <AuthorMeta post={post} />
    </article>
  );
}

// Compact grid card: wide image, pills, headline, byline.
export function GridCard({ post }: { post: CardPost }) {
  return (
    <article className="group flex flex-col gap-3">
      {post.featureImage && (
        <Link href={`/${post.slug}/`} tabIndex={-1} aria-hidden>
          <Image
            src={post.featureImage}
            alt=""
            width={800}
            height={450}
            // Same quality as the featured card so a post appearing in
            // both places resolves to one cached image URL.
            quality={60}
            sizes="(max-width: 1024px) 92vw, 480px"
            className="aspect-video w-full rounded-xl object-cover"
          />
        </Link>
      )}
      <TagPills tags={post.tags} />
      <Link href={`/${post.slug}/`}>
        <h3 className="text-xl font-bold tracking-tight group-hover:underline sm:text-2xl">
          {post.title}
        </h3>
      </Link>
      <AuthorMeta post={post} />
    </article>
  );
}

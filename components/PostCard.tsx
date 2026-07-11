import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="flex items-start gap-5 py-6">
      <div className="min-w-0 flex-1">
        <Link href={`/${post.slug}/`} className="group block">
          <h2 className="text-xl font-semibold tracking-tight group-hover:underline">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-neutral-600 dark:text-neutral-400">
            {post.excerpt}
          </p>
        </Link>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {" · "}
          {post.readingTimeMinutes} min read
        </p>
      </div>
      {post.featureImage && (
        <Link
          href={`/${post.slug}/`}
          className="hidden shrink-0 sm:block"
          tabIndex={-1}
          aria-hidden
        >
          <Image
            src={post.featureImage}
            alt=""
            width={160}
            height={107}
            className="h-[107px] w-[160px] rounded object-cover"
          />
        </Link>
      )}
    </article>
  );
}

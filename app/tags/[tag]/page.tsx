import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  // Recover the display casing ("netsuite" -> "NetSuite") from any post.
  const display =
    posts[0]?.tags.find((t) => t.toLowerCase() === tag) ?? tag;
  return {
    title: `Posts tagged "${display}"`,
    description: `All posts tagged ${display}.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();
  const display =
    posts[0].tags.find((t) => t.toLowerCase() === tag) ?? tag;

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">
        Posts tagged &ldquo;{display}&rdquo;
      </h1>
      <div className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  );
}

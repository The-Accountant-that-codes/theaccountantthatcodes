import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { GridCard } from "@/components/cards";

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
    <div className="mx-auto w-full max-w-6xl px-5 pt-10">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Posts tagged &ldquo;{display}&rdquo;
      </h1>
      <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <GridCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

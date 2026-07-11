import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { SITE_URL, SITE_NAME, DEFAULT_AUTHOR } from "@/lib/site";
import Byline from "@/components/Byline";
import RelatedPosts from "@/components/RelatedPosts";
import SubscribeForm from "@/components/SubscribeForm";

// Every post page is generated at build time; unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `${SITE_URL}/${post.slug}/`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      siteName: SITE_NAME,
      publishedTime: post.date,
      images: post.featureImage ? [post.featureImage] : undefined,
    },
    twitter: {
      card: post.featureImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: post.featureImage ? [post.featureImage] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const author = post.author ?? DEFAULT_AUTHOR;
  // JSON-LD Article schema for search engines and AI answer engines (GEO).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: author.name,
      ...(author.url && { url: author.url }),
    },
    ...(post.featureImage && {
      image: `${SITE_URL}${post.featureImage}`,
    }),
    mainEntityOfPage: `${SITE_URL}/${post.slug}/`,
  };

  return (
    <article className="mx-auto w-full max-w-2xl px-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-3">
          <Byline post={post} />
        </div>
        {post.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/tags/${tag.toLowerCase()}/`}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {post.featureImage && (
          <Image
            src={post.featureImage}
            alt=""
            width={1200}
            height={675}
            priority
            fetchPriority="high"
            quality={60}
            // Rendered at most 632px wide (max-w-2xl minus padding), so
            // don't let high-DPR screens pull the 2x-of-1200px variant.
            sizes="(max-width: 672px) 92vw, 632px"
            className="mt-6 rounded-lg"
          />
        )}
      </header>
      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        <MDXRemote
          source={post.body}
          options={{
            mdxOptions: {
              rehypePlugins: [
                [
                  rehypePrettyCode,
                  {
                    // Both themes are compiled in; CSS picks one via
                    // prefers-color-scheme (see globals.css). The
                    // "-default" variants use GitHub's current palette,
                    // whose comment gray passes WCAG AA contrast.
                    theme: {
                      light: "github-light-default",
                      dark: "github-dark-default",
                    },
                    defaultLang: "text",
                  },
                ],
              ],
            },
          }}
        />
      </div>
      <RelatedPosts posts={getRelatedPosts(post)} />
      <div className="mt-12">
        <SubscribeForm />
      </div>
    </article>
  );
}

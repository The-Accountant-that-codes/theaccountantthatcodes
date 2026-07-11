// Content loading for the MDX corpus in /content/posts.
//
// Stack note: we use plain gray-matter + next-mdx-remote instead of
// contentlayer2. Contentlayer adds a codegen step and generated types for
// what is, here, ten files with a small fixed schema — plain fs reads are
// easier to understand and debug, and there's one less build tool to break.

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { DEFAULT_AUTHOR } from "@/lib/site";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const PUBLIC_DIR = path.join(process.cwd(), "public");

// Only reference a headshot that is actually on disk (the authors folder
// is gitignored, so a fresh clone may not have it).
function resolveAuthorImage(imagePath?: string): string | undefined {
  if (!imagePath) return undefined;
  return fs.existsSync(path.join(PUBLIC_DIR, imagePath)) ? imagePath : undefined;
}

// Posts without an `author` frontmatter field belong to Francisco (the
// site default). Materializing that here keeps the fallback in one place.
function resolveAuthor(frontmatterAuthor?: PostAuthor): PostAuthor {
  const author = frontmatterAuthor ?? DEFAULT_AUTHOR;
  return { ...author, image: resolveAuthorImage(author.image) };
}

export interface PostAuthor {
  name: string;
  title?: string;
  url?: string;
  // Optional headshot path under /public (e.g. /images/authors/jane.jpg).
  // The folder is gitignored, so the loader only emits the path when the
  // file actually exists locally — otherwise cards fall back to initials.
  image?: string;
}

export interface Post {
  title: string;
  slug: string;
  date: string; // YYYY-MM-DD
  excerpt: string;
  tags: string[];
  featureImage?: string;
  draft: boolean;
  author: PostAuthor; // always set; defaults to Francisco
  body: string; // raw MDX body (no frontmatter)
  readingTimeMinutes: number;
}

function estimateReadingTime(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

function loadPost(filename: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
  const { data, content } = matter(raw);
  return {
    title: data.title,
    slug: data.slug,
    date:
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : String(data.date),
    excerpt: data.excerpt,
    tags: data.tags ?? [],
    featureImage: data.featureImage,
    draft: data.draft ?? false,
    author: resolveAuthor(data.author),
    body: content,
    readingTimeMinutes: estimateReadingTime(content),
  };
}

export function getAllPosts(): Post[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(loadPost)
    .filter((p) => !p.draft)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      // Frontmatter dates are day-precision, so same-day posts need a
      // deterministic tiebreaker. Ascending slug happens to match Ghost's
      // original publish order for the one same-day pair in this corpus
      // (apis-are-your-friend... was published after coding-without...).
      return a.slug < b.slug ? -1 : 1;
    });
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort();
}

// Tags are displayed with their original casing but matched
// case-insensitively in URLs (/tags/netsuite/ -> "NetSuite").
export function getPostsByTag(tag: string): Post[] {
  const needle = tag.toLowerCase();
  return getAllPosts().filter((p) =>
    p.tags.some((t) => t.toLowerCase() === needle)
  );
}

// Up to `limit` other posts sharing the most tags with `post`.
// Ties resolve to the newer post; posts sharing zero tags are excluded.
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const own = new Set(post.tags.map((t) => t.toLowerCase()));
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      post: p,
      overlap: p.tags.filter((t) => own.has(t.toLowerCase())).length,
    }))
    .filter((r) => r.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap) // getAllPosts is already newest-first
    .slice(0, limit)
    .map((r) => r.post);
}

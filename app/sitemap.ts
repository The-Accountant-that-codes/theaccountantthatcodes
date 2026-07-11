import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [
    { url: `${SITE_URL}/`, lastModified: posts[0]?.date },
    { url: `${SITE_URL}/about/` },
    ...posts.map((post) => ({
      url: `${SITE_URL}/${post.slug}/`,
      lastModified: post.date,
    })),
    ...getAllTags().map((tag) => ({
      url: `${SITE_URL}/tags/${tag.toLowerCase()}/`,
    })),
  ];
}

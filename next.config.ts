import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 60 for the large above-the-fold illustrations (LCP), 75 default.
    qualities: [60, 75],
    // AVIF first: the AI-illustration feature images compress ~40%
    // smaller than WebP, which is what LCP rides on.
    formats: ["image/avif", "image/webp"],
  },

  // Ghost served every post at /<slug>/ with a trailing slash. Keeping the
  // same URL shape means zero redirects on the URLs that matter.
  trailingSlash: true,

  async redirects() {
    return [
      // The "Setting Up Your Coding Environment" post was accidentally
      // published under the slug "coming-soon" on Ghost. The migration
      // renamed it; this 301 keeps the old URL working.
      // statusCode 301 instead of `permanent: true` (which sends a 308) --
      // CLAUDE.md calls for a 301 specifically.
      {
        source: "/coming-soon",
        destination: "/setting-up-your-coding-environment/",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

# CLAUDE.md — theaccountantthatcodes.com rebuild

## Project overview

Migrate "The Accountant That Codes" blog from Ghost(Pro) to a fully static
Next.js site on Vercel, with Kit (kit.com) handling the newsletter. Goal:
$0/month recurring cost, Medium-style reading experience, zero broken URLs.

Owner: Francisco (CPA/Controller with Python background — write code he can
read and maintain; explain non-obvious decisions in comments).

## Hard constraints — never violate

1. **URL preservation.** Every published post keeps its exact Ghost slug at
   the root level: `theaccountantthatcodes.com/<slug>/`. Never modify,
   "clean up," or re-slugify anything from the Ghost export. Slugs are the
   contract.
2. **Image rescue.** All images currently live on Ghost's CDN and will 404
   when the Ghost subscription is cancelled. Every image referenced in any
   post must be downloaded to `/public/images/<post-slug>/` and URLs
   rewritten to local paths. Zero remaining references to
   `*.ghost.io` or Ghost CDN domains in the final content.
3. **Secrets stay server-side.** `KIT_API_KEY` lives in `.env.local`
   (gitignored) and Vercel env vars only. It must never appear in client
   bundles, committed files, or logs. The subscribe form calls a Next.js
   route handler / server action — never Kit directly from the browser.
4. **Static-first.** All post pages are statically generated at build time.
   No CMS, no database, no runtime content fetching.

## Tech stack (decided — do not relitigate)

- Next.js (App Router, TypeScript), Tailwind CSS
- Content: MDX files in `/content/posts/`, one file per post
- MDX processing: contentlayer2 or plain `next-mdx-remote` + gray-matter —
  pick the simpler option that supports the frontmatter schema below and
  explain the choice
- Newsletter: Kit V4 API (`https://api.kit.com/v4`, auth via
  `X-Kit-Api-Key` header)
- Hosting: Vercel (Hobby tier)
- Analytics: none for now (may add later; don't scaffold)

## Frontmatter schema

```yaml
---
title: string            # required
slug: string             # required — verbatim from Ghost export
date: YYYY-MM-DD         # required — original published_at
excerpt: string          # required — Ghost custom_excerpt or first ~160 chars
tags: [string]           # optional — drives tag pages and related posts
featureImage: string     # optional — local path under /images/
draft: boolean           # default false
author:                  # optional — omit for Francisco (site default)
  name: string
  title: string          # e.g. "Controller at ..."
  url: string            # LinkedIn or personal site
---
```

## Session plan

### Session 1 — content migration (self-contained; complete before touching the site)

Input: Ghost export JSON at `./ghost-export/` plus the members CSV.

1. Write `scripts/migrate_ghost.py`:
   - Parse the Ghost export JSON; process only published posts.
   - Convert each post's HTML to MDX (markdown body; preserve code blocks
     with language hints, headings, links, embeds).
   - Emit frontmatter per the schema above.
   - Download every referenced image (post bodies + feature images) to
     `/public/images/<post-slug>/`; rewrite URLs to local paths.
   - Write files to `/content/posts/<slug>.mdx`.
2. Post-run verification (script must print a report):
   - Post count matches the export's published-post count (expect 10).
   - Zero remaining `ghost.io` / Ghost CDN URLs anywhere in `/content` —
     grep and fail loudly if found.
   - Every downloaded image exists and is non-empty.
3. Human review: Francisco reads every MDX file before session 2 begins.

### Session 2 — site build

1. Scaffold Next.js App Router project (TypeScript, Tailwind).
2. Routes:
   - `/` — homepage: post index, newest first, Medium-style article cards
     (title, excerpt, date, reading time, feature image if present).
   - `/[slug]` — post page, statically generated from MDX.
   - `/about` — placeholder page; Francisco supplies copy later.
   - `/tags/[tag]` — statically generated index of posts sharing a tag.
3. Post page extras:
   - Byline: render `author` from frontmatter when present (name, title,
     linked); default byline is Francisco when the field is omitted.
   - Related posts: up to 3 posts sharing the most tags, shown after the
     post body (before the subscribe form). Simple tag-overlap ranking —
     no embeddings, no dependencies.
4. Analytics: Vercel Analytics (`@vercel/analytics`) — one component in the
   root layout, nothing else.
5. Redirects in `next.config.js`:
   - `/coming-soon/` → the corrected slug for the "Setting Up Your Coding
     Environment" post (301). Confirm target slug with Francisco.
6. Subscribe form:
   - Component appears on homepage and at the end of each post.
   - Posts email to a route handler at `/api/subscribe`, which calls Kit V4
     `POST /v4/subscribers` with the `X-Kit-Api-Key` header.
   - Handle success, duplicate-subscriber, and error states in the UI.
   - Honeypot field for basic bot protection; no CAPTCHA.
7. Metadata & feeds:
   - Per-post `<title>`, meta description (from excerpt), canonical URL,
     OpenGraph + Twitter card tags.
   - Site meta description: "Python, APIs, and AI automation for finance
     teams — by a CPA who codes."
   - `sitemap.xml` and `rss.xml` generated at build time from the MDX corpus.
   - JSON-LD `Article` schema on post pages (supports GEO).
8. Footer: links to Francisco's actual profiles (LinkedIn, GitHub:
   github.com/The-Accountant-that-codes) — NOT Ghost's default social links.
   Confirm exact URLs with Francisco.

### Session 3 — design polish + deploy

1. Design direction: Medium-like reading experience.
   - Body: serif (Source Serif 4 or Charter fallback stack), ~19px,
     line-height ~1.7, measure ~680px.
   - UI/headings: clean sans (Inter or system stack).
   - Generous whitespace, minimal chrome, no sidebars.
   - Code blocks: syntax highlighting (Shiki or rehype-pretty-code), this is
     a technical blog — code presentation matters.
   - Dark mode: respect `prefers-color-scheme`; no toggle needed v1.
2. Lighthouse pass: ≥95 on Performance, Accessibility, SEO for homepage and
   one post page.
3. Deploy to Vercel; verify all routes on the `*.vercel.app` preview domain.
4. Produce `CUTOVER.md` checklist for Francisco: Porkbun DNS changes (replace
   root ALIAS→uixie.porkbun.com and www CNAME→ghost.io with Vercel's
   records), delete or decide on the `*` wildcard CNAME, leave Kit CNAMEs
   and `_dmarc` untouched, post-cutover cleanup of `_acme-challenge`
   records, then cancel Ghost only after all 10 URLs verified live on the
   new site.

## Acceptance criteria (definition of done)

- [ ] All 10 published posts render at their original Ghost URLs
- [ ] Zero image references to Ghost domains; all images served locally
- [ ] Subscribe form successfully creates a subscriber in Kit (test with a
      real email, then clean up the test subscriber)
- [ ] `/coming-soon/` 301-redirects to the corrected slug
- [ ] Tag pages render for every tag in the corpus; related posts appear on
      post pages; byline renders correctly with and without an `author` field
- [ ] Vercel Analytics reporting pageviews on the deployed site
- [ ] `rss.xml` and `sitemap.xml` valid and include all posts
- [ ] `npm run build` completes with no errors or type warnings
- [ ] Lighthouse ≥95 (Performance / Accessibility / SEO) on home + post page
- [ ] No secrets in the repo (verify before first push)

## Out of scope — do not build unless asked

- GitHub Action that creates a Kit broadcast on new post publish (v1.1 —
  strong candidate, and a future blog post)
- Comments and search — deliberately excluded, not deferred. Do not
  scaffold, stub, or leave hooks for them.
- About page copy (Francisco writes it)

## Working conventions

- Small commits with clear messages; commit after each verifiable milestone.
- Ask before adding any dependency beyond the stack listed above.
- When in doubt about content fidelity vs. prettiness, choose fidelity —
  this migration must be lossless first, beautiful second.

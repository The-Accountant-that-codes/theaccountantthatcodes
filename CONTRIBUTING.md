# Writing for The Accountant That Codes

Thanks for contributing a post! The site is fully static — articles are
MDX files in git, and merging to `main` publishes automatically. This
guide is everything you need.

## The short version

1. Clone the repo and create a branch:

   ```bash
   git clone git@github.com:The-Accountant-that-codes/theaccountantthatcodes.git
   cd theaccountantthatcodes
   git checkout -b post/your-article-slug
   ```

2. Write your article at `content/posts/<slug>.mdx` (see the template
   below). The slug becomes the permanent URL
   (`theaccountantthatcodes.com/<slug>/`), so choose it carefully — it
   can't change after publishing without breaking links.

3. Put any images in `public/images/<slug>/` and reference them as
   `/images/<slug>/filename.png`. First-time writers: also add a square
   headshot at `public/images/authors/firstname-lastname.jpg`.

4. Push your branch and open a pull request. Vercel will comment on the
   PR with a preview URL — that's your rendered post, exactly as it
   will look live. Francisco reviews and merges; the post is live about
   a minute later.

## Post template

```mdx
---
title: "Your title"
slug: "your-article-slug"            # must match the filename
date: 2026-08-01                      # publication date, YYYY-MM-DD
excerpt: "One or two sentences. Used for the meta description, social cards, and article cards on the homepage."
tags: ["NetSuite", "GitHub"]          # optional — reuse existing tags where possible
featureImage: "/images/your-article-slug/hero.png"   # optional but recommended
draft: false                          # true hides the post from the site
author:                               # guest writers only — omit for Francisco
  name: "Your Name"
  title: "Controller at Example Corp" # optional
  url: "https://www.linkedin.com/in/you"   # optional, linked from your byline
  image: "/images/authors/your-name.jpg"   # optional, falls back to initials
---

Your article in Markdown.

## Headings use ##

Code blocks get syntax highlighting when you tag the language:

```python
def hello():
    return "world"
```
```

## Conventions

- **Tags**: check existing ones first (NetSuite, GitHub, Snowflake,
  Salesforce, Ramp, Datawarehouse, Essentials) — a new tag creates a new
  tag page, which is fine when deliberate.
- **Images**: PNG or JPG, ideally ≥1200px wide for feature images
  (they're optimized automatically at serve time).
- **Voice**: practitioner-first and hands-on. Show the actual code,
  name the actual systems, and share what went wrong — that's what
  readers here come for.
- **MDX gotcha**: curly braces `{}` outside code blocks are parsed as
  JavaScript expressions and will break the build. Keep braces inside
  fenced code blocks or inline code spans.

## What happens after merge

Publishing is automatic (build + deploy, ~1 minute). Reading time, the
byline, related posts, tag pages, the RSS feed, and the sitemap are all
generated — nothing to configure. Emailing subscribers about the new
post is a separate, manual step that Francisco does through Kit.

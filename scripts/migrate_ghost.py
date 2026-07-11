#!/usr/bin/env python3
"""Migrate the Ghost export into MDX files under /content/posts, rescuing
every referenced image to /public/images/<slug>/ before the Ghost
subscription is cancelled. See CLAUDE.md "Session 1" for the full spec.
"""

import argparse
import glob
import json
import os
import re
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

REPO_ROOT = Path(__file__).resolve().parent.parent

# Ghost slug -> corrected output slug. Only the "coming-soon" post needs
# this (confirmed with Francisco); every other post keeps its Ghost slug
# verbatim per the URL-preservation rule in CLAUDE.md.
SLUG_OVERRIDES = {
    "coming-soon": "setting-up-your-coding-environment",
}

EXCERPT_MAX_CHARS = 160

# An accidental paste of the post's own editor URL, found in the
# "coming-soon" post body. Not a real content link -- strip it, keep the
# anchor text.
LEAKED_EDITOR_HOST = "the-accountant-that-codes.ghost.io"

PLACEHOLDER_RE = re.compile(r"§§PH(\d+)§§")


def parse_args():
    parser = argparse.ArgumentParser(description="Migrate Ghost export to MDX")
    parser.add_argument(
        "--export",
        default=None,
        help="Path to Ghost export JSON (default: the single *.json under ./ghost-export/)",
    )
    parser.add_argument(
        "--ghost-url",
        # The apex domain is a Porkbun URL forwarder (302s to l.ink, then
        # 404s on asset paths) -- www is the CNAME that actually points at
        # Ghost's storage and serves images.
        default=os.environ.get("GHOST_BASE_URL", "https://www.theaccountantthatcodes.com"),
        help="Live base URL used to resolve __GHOST_URL__ placeholders",
    )
    parser.add_argument("--out-content", default=str(REPO_ROOT / "content" / "posts"))
    parser.add_argument("--out-images", default=str(REPO_ROOT / "public" / "images"))
    parser.add_argument("--dry-run", action="store_true", help="Parse and print output without writing files")
    return parser.parse_args()


def find_export_path(explicit):
    if explicit:
        return Path(explicit)
    matches = sorted(glob.glob(str(REPO_ROOT / "ghost-export" / "*.json")))
    if len(matches) != 1:
        sys.exit(f"Expected exactly one *.json under ghost-export/, found {len(matches)}: {matches}")
    return Path(matches[0])


def build_tag_lookup(data):
    tags_by_id = {t["id"]: t for t in data["tags"]}
    tags_by_post = {}
    for row in data.get("posts_tags", []):
        tags_by_post.setdefault(row["post_id"], []).append(row)
    for rows in tags_by_post.values():
        rows.sort(key=lambda r: r.get("sort_order") or 0)
    return tags_by_id, tags_by_post


def resolve_ghost_url(value, base_url):
    if not value:
        return value
    return value.replace("__GHOST_URL__", base_url.rstrip("/"))


def download_image(url, dest_dir, dry_run):
    filename = url.split("/")[-1].split("?")[0]
    dest_path = dest_dir / filename
    web_path = f"/images/{dest_dir.name}/{filename}"
    if dry_run:
        print(f"  [dry-run] would download {url} -> {dest_path}")
        return web_path
    dest_dir.mkdir(parents=True, exist_ok=True)
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    if not resp.content:
        sys.exit(f"Downloaded image is empty: {url}")
    dest_path.write_bytes(resp.content)
    if dest_path.stat().st_size == 0:
        sys.exit(f"Written image file is empty: {dest_path}")
    return web_path


# The MDX body is compiled as JSX, where lowercase HTML attributes like
# `frameborder` are invalid DOM prop names -- React wants camelCase.
JSX_ATTR_RENAMES = {
    "frameborder": "frameBorder",
    "allowfullscreen": "allowFullScreen",
    "referrerpolicy": "referrerPolicy",
}


def iframe_to_jsx(iframe):
    parts = ["<iframe"]
    for name, value in iframe.attrs.items():
        name = JSX_ATTR_RENAMES.get(name, name)
        if isinstance(value, list):
            value = " ".join(value)
        if value == "":
            parts.append(name)  # bare boolean attribute (allowFullScreen)
        else:
            parts.append(f'{name}="{value}"')
    return " ".join(parts) + "></iframe>"


def protect_and_convert(html):
    """HTML -> Markdown, protecting nodes markdownify shouldn't touch.

    Code blocks must land inside real fenced blocks -- several posts have
    literal `{`/`}` in code samples, which MDX parses as JS expressions
    outside a fence. Embeds (the one YouTube iframe) are kept as raw HTML
    since MDX supports it directly.
    """
    soup = BeautifulSoup(html, "html.parser")
    payloads = []

    def stash(payload):
        idx = len(payloads)
        payloads.append(payload)
        return f"§§PH{idx}§§"

    def replace_as_block(node, payload):
        # A bare placeholder string has no block context, so adjacent
        # placeholders (e.g. two <pre> tags back to back) get concatenated
        # by markdownify with no separating blank line. Wrapping in a <p>
        # forces markdownify to treat each one as its own paragraph.
        block = soup.new_tag("p")
        block.string = stash(payload)
        node.replace_with(block)

    for pre in soup.find_all("pre"):
        code = pre.find("code")
        if code is None:
            continue
        lang = ""
        for cls in code.get("class", []):
            if cls.startswith("language-"):
                lang = cls[len("language-"):]
                break
        code_text = code.get_text().rstrip("\n")
        fence = f"```{lang}\n{code_text}\n```"
        replace_as_block(pre, fence)

    for figure in soup.select("figure.kg-embed-card"):
        iframe = figure.find("iframe")
        if iframe is not None:
            replace_as_block(figure, iframe_to_jsx(iframe))

    for a in soup.find_all("a", href=True):
        if LEAKED_EDITOR_HOST in a["href"] and "/ghost/#/editor" in a["href"]:
            a.replace_with(a.get_text())

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("__GHOST_URL__") and "/content/images/" not in href:
            a["href"] = href[len("__GHOST_URL__"):]

    # autolinks=False: markdownify would otherwise emit <https://...> for
    # links whose text equals their URL -- valid Markdown, but MDX parses
    # a bare `<` as the start of a JSX tag and fails to compile.
    markdown = md(str(soup), heading_style="ATX", bullets="-", autolinks=False).strip() + "\n"
    markdown = PLACEHOLDER_RE.sub(lambda m: payloads[int(m.group(1))], markdown)
    return markdown


def plain_text(html):
    text = BeautifulSoup(html or "", "html.parser").get_text(" ", strip=True)
    # get_text's separator adds a space at every tag boundary, including
    # right before punctuation that followed an inline tag (e.g. a link
    # right before a comma) -- collapse "word ," back to "word,".
    return re.sub(r"\s+([,.;:])", r"\1", text)


def build_excerpt(post):
    custom = (post.get("custom_excerpt") or "").strip()
    if custom:
        return custom
    text = plain_text(post.get("html"))
    if len(text) <= EXCERPT_MAX_CHARS:
        return text
    truncated = text[:EXCERPT_MAX_CHARS].rsplit(" ", 1)[0]
    return truncated.rstrip(",.;:") + "..."


def yaml_str(value):
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def build_frontmatter(title, slug, date, excerpt, tags, feature_image):
    lines = [
        "---",
        f"title: {yaml_str(title)}",
        f"slug: {yaml_str(slug)}",
        f"date: {date}",
        f"excerpt: {yaml_str(excerpt)}",
    ]
    if tags:
        lines.append("tags:")
        lines.extend(f"  - {yaml_str(t)}" for t in tags)
    if feature_image:
        lines.append(f"featureImage: {yaml_str(feature_image)}")
    lines.append("draft: false")
    lines.append("---")
    return "\n".join(lines)


def process_post(post, tags_by_id, tags_by_post, base_url, out_images, dry_run):
    original_slug = post["slug"]
    slug = SLUG_OVERRIDES.get(original_slug, original_slug)
    if slug != original_slug:
        print(f"[SLUG OVERRIDE] {original_slug} -> {slug}")

    feature_image_local = None
    if post.get("feature_image"):
        resolved = resolve_ghost_url(post["feature_image"], base_url)
        feature_image_local = download_image(resolved, out_images / slug, dry_run)

    tag_rows = tags_by_post.get(post["id"], [])
    tag_names = [tags_by_id[r["tag_id"]]["name"] for r in tag_rows if r["tag_id"] in tags_by_id]

    body_markdown = protect_and_convert(post.get("html") or "")
    excerpt = build_excerpt(post)
    date = (post.get("published_at") or "")[:10]
    frontmatter = build_frontmatter(post["title"], slug, date, excerpt, tag_names, feature_image_local)

    content = frontmatter + "\n\n" + body_markdown
    orig_chars = len(plain_text(post.get("html")))
    new_chars = len(plain_text(body_markdown))
    return slug, content, orig_chars, new_chars


def run_verification(out_content):
    print("\n--- Verification ---")
    ok = True

    mdx_files = sorted(out_content.glob("*.mdx"))
    if len(mdx_files) == 10:
        print("PASS: 10 MDX files present")
    else:
        print(f"FAIL: expected 10 MDX files, found {len(mdx_files)}")
        ok = False

    bad_refs = []
    image_refs = set()
    for f in mdx_files:
        text = f.read_text(encoding="utf-8")
        for i, line in enumerate(text.splitlines(), 1):
            if "ghost.io" in line or "__GHOST_URL__" in line:
                bad_refs.append((f.name, i, line.strip()))
        image_refs.update(re.findall(r'/images/[^\s"\')]+', text))

    if bad_refs:
        print(f"FAIL: {len(bad_refs)} lingering ghost.io/__GHOST_URL__ references:")
        for name, i, line in bad_refs:
            print(f"  {name}:{i}: {line}")
        ok = False
    else:
        print("PASS: zero ghost.io/__GHOST_URL__ references")

    missing_images = [
        ref for ref in image_refs
        if not (REPO_ROOT / "public" / ref.lstrip("/")).is_file()
        or (REPO_ROOT / "public" / ref.lstrip("/")).stat().st_size == 0
    ]
    if missing_images:
        print(f"FAIL: missing/empty images: {missing_images}")
        ok = False
    else:
        print(f"PASS: all {len(image_refs)} referenced images present and non-empty")

    return ok


def main():
    args = parse_args()
    export_path = find_export_path(args.export)
    print(f"Loading export: {export_path}")
    with open(export_path, "r", encoding="utf-8") as f:
        raw = json.load(f)
    data = raw["db"][0]["data"]

    posts = [p for p in data["posts"] if p["type"] == "post" and p["status"] == "published"]
    if len(posts) != 10:
        sys.exit(f"Expected 10 published posts, found {len(posts)}")

    tags_by_id, tags_by_post = build_tag_lookup(data)

    out_content = Path(args.out_content)
    out_images = Path(args.out_images)
    if not args.dry_run:
        out_content.mkdir(parents=True, exist_ok=True)

    char_report = []
    for post in posts:
        slug, content, orig_chars, new_chars = process_post(
            post, tags_by_id, tags_by_post, args.ghost_url, out_images, args.dry_run
        )
        char_report.append((slug, orig_chars, new_chars))
        if args.dry_run:
            print(f"\n===== [dry-run] {slug} =====")
            print(content)
        else:
            out_path = out_content / f"{slug}.mdx"
            out_path.write_text(content, encoding="utf-8")
            print(f"Wrote {out_path}")

    print("\n--- Char count sanity check (original html text vs. generated markdown text) ---")
    for slug, orig, new in char_report:
        delta_pct = 0 if orig == 0 else round((new - orig) / orig * 100, 1)
        flag = "  <-- check this" if abs(delta_pct) > 15 else ""
        print(f"  {slug}: {orig} -> {new} chars ({delta_pct:+}%){flag}")

    if args.dry_run:
        print("\nDry run complete -- no files written.")
        return

    if not run_verification(out_content):
        sys.exit(1)
    print("\nAll checks passed.")


if __name__ == "__main__":
    main()

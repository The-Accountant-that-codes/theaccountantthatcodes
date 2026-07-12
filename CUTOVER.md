# Cutover checklist — Ghost(Pro) → Vercel

Work through this top to bottom. Nothing here is destructive until the
final step (cancelling Ghost), and every step before it is reversible.

## 0. Prerequisites (done before touching DNS)

- [x] Site deployed to Vercel and all routes verified on the
      `*.vercel.app` preview domain (all 10 post URLs, `/about/`,
      `/tags/*`, `/rss.xml`, `/sitemap.xml`, `/coming-soon/` redirect).
- [x] `KIT_API_KEY` set in Vercel → Project → Settings → Environment
      Variables (Production). Test the subscribe form on the preview
      domain after setting it.
- [x] Add `theaccountantthatcodes.com` and `www.theaccountantthatcodes.com`
      as domains in Vercel → Project → Settings → Domains. Vercel will
      show the exact DNS records it wants — use those values in step 1
      (they should match the ones below, but Vercel's UI is the source
      of truth).

## 1. Porkbun DNS changes

In Porkbun → theaccountantthatcodes.com → DNS records:

- [x] **Root (apex)**: delete the current ALIAS record pointing to
      `uixie.porkbun.com` (Porkbun's URL forwarder). Also remove the
      associated URL-forwarding rule if one exists under "URL
      Forwarding". Replace with Vercel's apex record:
      `A @ 76.76.21.21` (or the ALIAS/A value Vercel's Domains page
      shows for the apex).
- [x] **www**: delete the CNAME pointing to `ghost.io`. Replace with
      `CNAME www cname.vercel-dns.com` (or the value Vercel shows).
- [x] **`*` wildcard CNAME**: decide. It currently catches all other
      subdomains. Recommended: delete it — nothing should resolve except
      the records you define. If you keep it, point it somewhere you
      control, never at ghost.io.
- [x] **Leave untouched**: the Kit CNAMEs (newsletter sending domain)
      and the `_dmarc` TXT record. Email deliverability depends on them
      and they have nothing to do with the website move.

## 2. Verify after DNS propagates (minutes to ~1 hour)

- [x] `https://theaccountantthatcodes.com/` loads the new site with a
      valid certificate (Vercel provisions it automatically once DNS
      points at them).
- [x] `https://www.theaccountantthatcodes.com/` redirects to the apex
      (configure the redirect direction in Vercel → Domains; apex as
      primary matches the site's canonical URLs).
- [x] All 10 original post URLs return 200 on the live domain:

      /setting-up-your-coding-environment/
      /coding-without-the-syntax-using-ai-agents-cursor-and-claude-code/
      /apis-are-your-friend-pulling-financial-data-directly-from-your-systems/
      /working-with-netsuite-via-api-from-credentials-to-crud/
      /sql-the-fastest-way-to-start-coding-and-why-suiteql-comes-next/
      /mcp-and-netsuite-giving-ai-real-context-over-your-erp/
      /github-from-vibe-coding-to-controlled-automation-part-1/
      /github-from-version-control-to-production-ready-automation-part-2/
      /query-in-plain-english-curate-your-snowflake-datawarehouse-semantic-layers-for-finance-engineers/
      /stop-waiting-on-invoices-accurate-accruals-from-vendor-billing-apis/

- [x] `/coming-soon/` 301-redirects to
      `/setting-up-your-coding-environment/`.
- [x] Subscribe form creates a subscriber in Kit from the live domain
      (use a test address, then remove it in the Kit dashboard).
- [x] Vercel Analytics shows pageviews (visit a few pages, check the
      Analytics tab).

## 3. Post-cutover cleanup

- [ ] Delete stale `_acme-challenge` TXT/CNAME records in Porkbun —
      they were for Ghost's certificate issuance and are dead weight now.
- [ ] Optional: submit the sitemap in Google Search Console
      (`https://theaccountantthatcodes.com/sitemap.xml`).

## 4. Cancel Ghost — LAST, and only after everything above is checked

- [ ] All 10 URLs verified live on the new site (step 2), images loading
      from `/images/...` (they're served from the repo now, not Ghost's
      CDN — the migration already localized them, so nothing breaks when
      Ghost goes dark).
- [ ] Export a final copy of members from Ghost if any subscribed since
      the last export, and import them into Kit.
- [ ] Cancel the Ghost(Pro) subscription.

import Link from "next/link";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { FeaturedCard, GridCard } from "@/components/cards";
import LatestPosts from "@/components/LatestPosts";
import SubscribeForm from "@/components/SubscribeForm";

export default function HomePage() {
  const posts = getAllPosts();
  // Boulevard-style split: newest post is the big featured card, the
  // next two stack beside it; the full list repeats below as the
  // filterable "Latest posts" section.
  const [featured, ...rest] = posts;
  const side = rest.slice(0, 2);
  // Strip MDX bodies before handing posts to the client component.
  const latest = posts.map(({ body: _body, ...rest }) => rest);

  return (
    <div className="mx-auto w-full max-w-6xl px-5">
      {/* Hero: centered site statement */}
      <section className="py-16 text-center sm:py-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Python, APIs, and AI automation for finance teams.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
          Hands-on guides for pulling data out of your ERP, automating the
          boring parts of the close, and putting AI to work — by a CPA who
          codes.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="#subscribe"
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Subscribe
          </Link>
          <Link
            href="/about/"
            className="rounded-full bg-neutral-100 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            About
          </Link>
        </div>
      </section>

      {/* Featured: big card left, two stacked right */}
      <section className="grid gap-10 lg:grid-cols-2">
        <FeaturedCard post={featured} />
        <div className="flex flex-col gap-10">
          {side.map((post) => (
            <GridCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* Latest posts: tag filter + load more */}
      <div className="mt-24">
        <LatestPosts posts={latest} tags={getAllTags()} />
      </div>

      <div id="subscribe" className="mx-auto mt-24 max-w-2xl scroll-mt-8">
        <SubscribeForm />
      </div>
    </div>
  );
}

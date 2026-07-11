import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import SubscribeForm from "@/components/SubscribeForm";

export default function HomePage() {
  const posts = getAllPosts();
  return (
    <>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <div className="mt-10">
        <SubscribeForm />
      </div>
    </>
  );
}

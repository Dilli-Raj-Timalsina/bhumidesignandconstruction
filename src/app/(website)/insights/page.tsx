import type { Metadata } from "next";

import { BlogCard } from "@/components/website/blog-card";
import { ContentEmptyState } from "@/components/website/empty-content";
import { getPosts } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Insights",
  description: "Notes and perspectives from BHUMI Design & Construction.",
  alternates: { canonical: "/insights" },
};

export default async function InsightsPage() {
  const posts = await getPosts();
  return (
    <>
      <section className="border-b border-line bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <p className="eyebrow">Insights</p>
          <h1 className="display-title mt-6 max-w-5xl">
            Notes from the practice.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            Updates, observations and project perspectives from BHUMI.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-28">
        <div className="site-shell">
          {posts.length > 0 ? (
            <div className="grid gap-x-7 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <ContentEmptyState
              title="No insights published yet."
              detail="Published articles will appear here when BHUMI is ready to share them."
            />
          )}
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";

import { BlogCard } from "@/components/website/blog-card";
import { ContentEmptyState } from "@/components/website/empty-content";
import { getPosts } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Insights",
  description: "Project updates and notes from BHUMI Design & Construction.",
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
            Updates from the work.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            BHUMI will share project updates and construction notes here as they
            are approved for publication.
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
              detail="The supplied portfolio contains project records rather than standalone articles. Future approved updates will appear here."
            />
          )}
        </div>
      </section>
    </>
  );
}

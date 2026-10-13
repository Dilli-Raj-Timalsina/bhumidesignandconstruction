import { BlogCard } from "@/components/website/blog-card";
import { ContentEmptyState } from "@/components/website/empty-content";
import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getPosts, getSiteContent } from "@/features/content/queries";

export const generateMetadata = () =>
  getPageIntroMetadata("insights", "/insights");

export default async function InsightsPage() {
  const [posts, site] = await Promise.all([getPosts(), getSiteContent()]);
  return (
    <>
      <PageIntro page="insights" intro={site.pageIntros.insights} />
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

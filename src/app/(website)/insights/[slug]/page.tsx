import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { BlogCard } from "@/components/website/blog-card";
import { MediaFrame } from "@/components/website/media-frame";
import { RichContent } from "@/components/website/rich-content";
import { getPostBySlug, getPosts } from "@/features/content/queries";

type PageProps = { params: Promise<{ slug: string }> };

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Insight" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: post.coverImage
      ? { images: [{ url: post.coverImage, alt: post.title }] }
      : undefined,
  };
}

export default async function InsightDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = (await getPosts())
    .filter(
      (item) =>
        item.id !== post.id &&
        (!post.category || item.category === post.category),
    )
    .slice(0, 3);
  const date = formatDate(post.publishedAt);
  return (
    <>
      <article>
        <div className="site-shell py-7">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-bhumi"
          >
            <ArrowLeft size={16} /> All insights
          </Link>
        </div>
        <header className="border-y border-line bg-canvas">
          <div className="site-shell py-16 md:py-24">
            <p className="eyebrow">{post.category || "Insight"}</p>
            <h1 className="display-title mt-6 max-w-5xl">{post.title}</h1>
            {post.excerpt && (
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
                {post.excerpt}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
              {date && <span>{date}</span>}
              {post.author && <span>By {post.author}</span>}
            </div>
          </div>
        </header>
        {post.coverImage && (
          <div className="site-shell py-8 md:py-12">
            <div className="relative aspect-[1.7/1] overflow-hidden">
              <MediaFrame
                src={post.coverImage}
                alt={post.title}
                className="absolute inset-0 h-full w-full"
                priority
                sizes="100vw"
              />
            </div>
          </div>
        )}
        <div className="site-shell py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            {post.content ? (
              <RichContent html={post.content} />
            ) : (
              <p className="text-base leading-8 text-muted">
                The article body will be published here.
              </p>
            )}
            {post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-line px-3 py-1.5 text-xs font-semibold text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <section className="border-t border-line bg-canvas py-16 md:py-24">
          <div className="site-shell">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Keep reading</p>
                <h2 className="section-title mt-5">Related insights.</h2>
              </div>
              <ButtonLink href="/insights" variant="text" className="shrink-0">
                All insights <ArrowUpRight size={16} />
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

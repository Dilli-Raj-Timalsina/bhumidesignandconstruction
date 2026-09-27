import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MediaFrame } from "./media-frame";

export type BlogCardData = {
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  coverImage?: string | null;
};

function readableDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
        date,
      );
}

export function BlogCard({ post }: { post: BlogCardData }) {
  const date = readableDate(post.publishedAt);
  return (
    <article className="group">
      <Link
        href={`/insights/${post.slug}`}
        className="block aspect-[1.43/1] overflow-hidden"
      >
        <MediaFrame
          src={post.coverImage}
          alt={post.title}
          className="h-full w-full"
          sizes="(max-width: 768px) 100vw, 33vw"
          label="Insight cover image"
        />
      </Link>
      <div className="pt-5">
        {(post.category || date) && (
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-bhumi">
            {[post.category, date].filter(Boolean).join(" · ")}
          </p>
        )}
        <h3 className="mt-2 text-xl font-semibold leading-[1.2] tracking-[-0.035em] text-ink">
          <Link
            href={`/insights/${post.slug}`}
            className="transition-colors hover:text-bhumi"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
            {post.excerpt}
          </p>
        )}
        <Link
          href={`/insights/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-bhumi"
        >
          Read insight{" "}
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </article>
  );
}

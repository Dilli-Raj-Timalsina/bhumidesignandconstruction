import Link from "next/link";
import { ExternalLink, Pencil, Search } from "lucide-react";

import { deletePostAction } from "@/app/actions/admin";
import { getAdminPosts } from "@/components/admin/admin-data";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";

type PostsPageProps = { searchParams: Promise<{ q?: string | string[] }> };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const query = first((await searchParams).q);
  const posts = await getAdminPosts(query);

  return (
    <div>
      <PageHeader
        title="Insights"
        description="Write, edit, and publish company articles."
        action={{ href: "/admin/posts/new", label: "New article" }}
      />
      <form className="mb-5 flex max-w-md gap-2" role="search">
        <label htmlFor="post-search" className="sr-only">
          Search insights
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="post-search"
            name="q"
            defaultValue={query ?? ""}
            placeholder="Search insights"
            className="min-h-10 w-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          className="min-h-10 border border-line px-4 text-sm font-semibold text-ink hover:bg-white"
        >
          Search
        </button>
      </form>
      {posts.length ? (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-line bg-slate-50 text-xs font-semibold uppercase tracking-[0.09em] text-muted">
              <tr>
                <th className="px-5 py-3">Article</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Visibility</th>
                <th className="px-5 py-3">Published</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-semibold text-ink hover:text-bhumi"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">/{post.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {post.category ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {post.publishedAt
                      ? new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                        }).format(new Date(post.publishedAt))
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-bhumi hover:text-bhumi-dark"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                      {post.status === "published" ? (
                        <Link
                          href={`/insights/${post.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-ink"
                        >
                          <ExternalLink className="size-3.5" />
                          View
                        </Link>
                      ) : null}
                      <ConfirmDialog
                        trigger={
                          <button
                            type="button"
                            className="text-sm font-semibold text-red-700 hover:text-red-800"
                          >
                            Delete
                          </button>
                        }
                        title="Delete article?"
                        description="This permanently removes the article from the content library."
                        action={deletePostAction}
                        values={{ id: post.id }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={query ? "No matching insights" : "No insights yet"}
          description={
            query
              ? "Try a different search term, or clear the search to view all insights."
              : "Create an article when you have an approved insight to share."
          }
          action={
            !query
              ? { href: "/admin/posts/new", label: "Write article" }
              : undefined
          }
        />
      )}
    </div>
  );
}

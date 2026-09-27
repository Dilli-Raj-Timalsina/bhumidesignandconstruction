import Link from "next/link";
import { ExternalLink, Pencil, Search } from "lucide-react";

import { deleteGalleryAlbumAction } from "@/app/actions/admin";
import { getAdminAlbums } from "@/components/admin/admin-data";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";

type GalleryPageProps = { searchParams: Promise<{ q?: string | string[] }> };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const query = first((await searchParams).q);
  const albums = await getAdminAlbums(query);

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Organize project photography into public albums."
        action={{ href: "/admin/gallery/new", label: "New album" }}
      />
      <form className="mb-5 flex max-w-md gap-2" role="search">
        <label htmlFor="gallery-search" className="sr-only">
          Search gallery albums
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="gallery-search"
            name="q"
            defaultValue={query ?? ""}
            placeholder="Search albums"
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
      {albums.length ? (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-line bg-slate-50 text-xs font-semibold uppercase tracking-[0.09em] text-muted">
              <tr>
                <th className="px-5 py-3">Album</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Visibility</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {albums.map((album) => (
                <tr key={album.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/gallery/${album.id}`}
                      className="font-semibold text-ink hover:text-bhumi"
                    >
                      {album.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">/{album.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {album.category ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={album.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {album.sortOrder}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/gallery/${album.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-bhumi hover:text-bhumi-dark"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                      {album.status === "published" ? (
                        <Link
                          href="/gallery"
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
                        title="Delete album?"
                        description="This permanently removes the album and its associated image records."
                        action={deleteGalleryAlbumAction}
                        values={{ id: album.id }}
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
          title={query ? "No matching albums" : "No gallery albums yet"}
          description={
            query
              ? "Try a different search term, or clear the search to view all albums."
              : "Create an album before adding curated project photography."
          }
          action={
            !query
              ? { href: "/admin/gallery/new", label: "Create album" }
              : undefined
          }
        />
      )}
    </div>
  );
}

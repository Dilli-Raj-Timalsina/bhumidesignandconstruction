import type { Metadata } from "next";

import { ContentEmptyState } from "@/components/website/empty-content";
import { GalleryBrowser } from "@/components/website/gallery-browser";
import { getGalleryAlbums } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Portfolio photography and proposal imagery from BHUMI Design & Construction projects in Dang.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();
  return (
    <>
      <section className="border-b border-line bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <p className="eyebrow">Gallery</p>
          <h1 className="display-title mt-6 max-w-5xl">
            The detail is in the work.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            Project photography and proposal imagery, organized by the work
            documented in BHUMI&apos;s portfolio.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-28">
        <div className="site-shell">
          {albums.length > 0 ? (
            <GalleryBrowser albums={albums} />
          ) : (
            <ContentEmptyState
              title="The project gallery is being updated."
              detail="BHUMI portfolio photography will appear here shortly."
            />
          )}
        </div>
      </section>
    </>
  );
}

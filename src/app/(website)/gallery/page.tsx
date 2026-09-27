import type { Metadata } from "next";

import { ContentEmptyState } from "@/components/website/empty-content";
import { GalleryBrowser } from "@/components/website/gallery-browser";
import { getGalleryAlbums } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Project photography from BHUMI Design & Construction.",
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
            A curated record of project work, organized by album and category.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-28">
        <div className="site-shell">
          {albums.length > 0 ? (
            <GalleryBrowser albums={albums} />
          ) : (
            <ContentEmptyState
              title="The gallery is being prepared."
              detail="Project photography, alt text and captions can be organized into albums through the content workspace."
            />
          )}
        </div>
      </section>
    </>
  );
}

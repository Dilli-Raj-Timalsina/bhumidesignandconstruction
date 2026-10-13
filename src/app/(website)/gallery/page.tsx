import { ContentEmptyState } from "@/components/website/empty-content";
import { GalleryBrowser } from "@/components/website/gallery-browser";
import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getGalleryAlbums, getSiteContent } from "@/features/content/queries";

export const generateMetadata = () =>
  getPageIntroMetadata("gallery", "/gallery");

export default async function GalleryPage() {
  const [albums, site] = await Promise.all([
    getGalleryAlbums(),
    getSiteContent(),
  ]);
  return (
    <>
      <PageIntro page="gallery" intro={site.pageIntros.gallery} />
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

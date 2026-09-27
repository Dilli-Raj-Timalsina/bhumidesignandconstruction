import { notFound } from "next/navigation";

import { getAdminAlbum, getAlbumImages } from "@/components/admin/admin-data";
import { GalleryAlbumForm } from "@/components/admin/content-forms";
import { ImageCollectionManager } from "@/components/admin/image-collection-manager";
import { PageHeader } from "@/components/admin/page-header";

type GalleryAlbumEditPageProps = { params: Promise<{ id: string }> };

export default async function GalleryAlbumEditPage({
  params,
}: GalleryAlbumEditPageProps) {
  const { id } = await params;
  const [album, images] = await Promise.all([
    getAdminAlbum(id),
    getAlbumImages(id),
  ]);
  if (!album) notFound();
  return (
    <>
      <PageHeader
        title="Edit gallery album"
        description="Update the album and curate its images."
        backHref="/admin/gallery"
      />
      <GalleryAlbumForm album={album} />
      <div className="mt-10 border-t border-line pt-10">
        <ImageCollectionManager
          kind="gallery"
          parentId={album.id}
          images={images}
        />
      </div>
    </>
  );
}

import { GalleryAlbumForm } from "@/components/admin/content-forms";
import { PageHeader } from "@/components/admin/page-header";

export default function NewGalleryAlbumPage() {
  return (
    <>
      <PageHeader
        title="New gallery album"
        description="Create an album before uploading the images it contains."
        backHref="/admin/gallery"
      />
      <GalleryAlbumForm />
    </>
  );
}

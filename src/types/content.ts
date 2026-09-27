import type { Database } from "@/types/database";

export type ContentStatus = Database["public"]["Enums"]["content_status"];
export type ContactMessageStatus =
  Database["public"]["Enums"]["contact_message_status"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectImage =
  Database["public"]["Tables"]["project_images"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type GalleryAlbum =
  Database["public"]["Tables"]["gallery_albums"]["Row"];
export type GalleryImage =
  Database["public"]["Tables"]["gallery_images"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type ContactMessage =
  Database["public"]["Tables"]["contact_messages"]["Row"];

export type ProjectWithImages = Project & { project_images: ProjectImage[] };
export type GalleryAlbumWithImages = GalleryAlbum & {
  gallery_images: GalleryImage[];
};
export type PostWithAuthor = Post;

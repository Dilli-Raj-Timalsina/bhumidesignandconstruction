import { z } from "zod";

import {
  checkboxSchema,
  contentStatusSchema,
  idSchema,
  nullablePublishedAtSchema,
  nullableStoragePathSchema,
  nullableText,
  requiredText,
  slugSchema,
  sortOrderSchema,
} from "./common";

export const galleryAlbumSchema = z
  .object({
    title: requiredText("Album title", 180),
    slug: slugSchema,
    description: nullableText(20_000),
    cover_image_path: nullableStoragePathSchema,
    category: nullableText(120),
    featured: checkboxSchema,
    sort_order: sortOrderSchema,
    status: contentStatusSchema.default("draft"),
    published_at: nullablePublishedAtSchema,
  })
  .strict();

export const galleryAlbumUpdateSchema = galleryAlbumSchema
  .extend({ id: idSchema })
  .strict();

export const galleryImageSchema = z
  .object({
    album_id: idSchema,
    image_path: nullableStoragePathSchema.refine(
      (value) => value !== null,
      "An image is required.",
    ),
    caption: nullableText(500),
    alt_text: nullableText(300),
    sort_order: sortOrderSchema,
  })
  .strict();

export const galleryImageUpdateSchema = galleryImageSchema
  .extend({ id: idSchema })
  .strict();

export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;
export type GalleryAlbumUpdateInput = z.infer<typeof galleryAlbumUpdateSchema>;
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;
export type GalleryImageUpdateInput = z.infer<typeof galleryImageUpdateSchema>;

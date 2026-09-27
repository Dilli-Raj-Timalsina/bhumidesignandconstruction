import { z } from "zod";

import {
  contentStatusSchema,
  idSchema,
  nullablePublishedAtSchema,
  nullableStoragePathSchema,
  nullableText,
  nullableUuidSchema,
  requiredText,
  slugSchema,
} from "./common";

const tagSchema = requiredText("Tag", 50);

export const tagsSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") return [];
    if (typeof value === "string") {
      return value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
    return value;
  },
  z
    .array(tagSchema)
    .max(20, "Use no more than 20 tags.")
    .transform((tags) => [...new Set(tags.map((tag) => tag.toLowerCase()))]),
);

export const postSchema = z
  .object({
    title: requiredText("Post title", 180),
    slug: slugSchema,
    excerpt: nullableText(800),
    cover_image_path: nullableStoragePathSchema,
    content: nullableText(100_000),
    category: nullableText(120),
    tags: tagsSchema,
    author: nullableText(160),
    author_id: nullableUuidSchema,
    status: contentStatusSchema.default("draft"),
    published_at: nullablePublishedAtSchema,
    seo_title: nullableText(180),
    seo_description: nullableText(320),
  })
  .strict();

export const postUpdateSchema = postSchema.extend({ id: idSchema }).strict();

export type PostInput = z.infer<typeof postSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;

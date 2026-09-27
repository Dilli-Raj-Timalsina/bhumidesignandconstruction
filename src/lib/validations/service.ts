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

export const serviceSchema = z
  .object({
    title: requiredText("Service title", 180),
    slug: slugSchema,
    short_description: nullableText(600),
    description: nullableText(20_000),
    cover_image_path: nullableStoragePathSchema,
    icon: nullableText(80),
    featured: checkboxSchema,
    sort_order: sortOrderSchema,
    status: contentStatusSchema.default("draft"),
    published_at: nullablePublishedAtSchema,
    seo_title: nullableText(180),
    seo_description: nullableText(320),
  })
  .strict();

export const serviceUpdateSchema = serviceSchema
  .extend({ id: idSchema })
  .strict();

export type ServiceInput = z.infer<typeof serviceSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;

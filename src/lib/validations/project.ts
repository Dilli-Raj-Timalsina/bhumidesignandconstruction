import { z } from "zod";

import {
  checkboxSchema,
  contentStatusSchema,
  idSchema,
  nonNegativeIntegerSchema,
  nullableDateSchema,
  nullablePublishedAtSchema,
  nullableStoragePathSchema,
  nullableText,
  requiredText,
  slugSchema,
  sortOrderSchema,
} from "./common";

export const projectSchema = z
  .object({
    title: requiredText("Project title", 180),
    slug: slugSchema,
    category: nullableText(120),
    location: nullableText(240),
    client: nullableText(240),
    main_contractor: nullableText(240),
    financing: nullableText(240),
    description: nullableText(20_000),
    scope_of_work: nullableText(20_000),
    execution_details: nullableText(20_000),
    project_status: nullableText(80),
    status: contentStatusSchema.default("draft"),
    published_at: nullablePublishedAtSchema,
    start_date: nullableDateSchema,
    completion_date: nullableDateSchema,
    manpower: nonNegativeIntegerSchema,
    featured: checkboxSchema,
    cover_image_path: nullableStoragePathSchema,
    sort_order: sortOrderSchema,
    seo_title: nullableText(180),
    seo_description: nullableText(320),
  })
  .strict()
  .superRefine((data, context) => {
    if (
      data.start_date &&
      data.completion_date &&
      data.start_date > data.completion_date
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completion_date"],
        message: "Completion date cannot be before the start date.",
      });
    }
  });

export const projectUpdateSchema = projectSchema
  .extend({ id: idSchema })
  .strict();

export const projectImageSchema = z
  .object({
    project_id: idSchema,
    image_path: nullableStoragePathSchema.refine(
      (value) => value !== null,
      "An image is required.",
    ),
    caption: nullableText(500),
    alt_text: nullableText(300),
    sort_order: sortOrderSchema,
  })
  .strict();

export const projectImageUpdateSchema = projectImageSchema
  .extend({ id: idSchema })
  .strict();

export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectImageInput = z.infer<typeof projectImageSchema>;
export type ProjectImageUpdateInput = z.infer<typeof projectImageUpdateSchema>;

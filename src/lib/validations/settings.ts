import { z } from "zod";

import {
  idSchema,
  nullableStoragePathSchema,
  nullableText,
  nullableUrl,
  requiredText,
} from "./common";

const socialLinkNameSchema = z.enum([
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "x",
]);

const nullableEmailSchema = z
  .union([
    z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address.")
      .max(254),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((value) =>
    typeof value === "string" && value.length > 0 ? value : null,
  );

export const socialLinksSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") return {};
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  },
  z.partialRecord(socialLinkNameSchema, nullableUrl()).transform((links) => {
    return Object.fromEntries(
      Object.entries(links).filter(
        (entry): entry is [string, string] => entry[1] !== null,
      ),
    );
  }),
);

export const siteSettingsSchema = z
  .object({
    company_name: requiredText("Company name", 180),
    short_name: nullableText(80),
    tagline: nullableText(240),
    description: nullableText(2_000),
    location: nullableText(240),
    address: nullableText(500),
    email: nullableEmailSchema,
    phone: nullableText(50),
    logo_path: nullableStoragePathSchema,
    hero_title: nullableText(240),
    hero_description: nullableText(2_000),
    hero_image_path: nullableStoragePathSchema,
    about_image_path: nullableStoragePathSchema,
    about_title: nullableText(240),
    about_content: nullableText(20_000),
    social_links: socialLinksSchema,
    default_seo_title: nullableText(180),
    default_seo_description: nullableText(320),
  })
  .strict();

export const siteSettingsUpdateSchema = siteSettingsSchema
  .extend({ id: idSchema })
  .strict();

/**
 * Narrow server-action contract for the dedicated contact-details screen.
 * It intentionally cannot modify brand, SEO, media, or any other global field.
 */
export const contactDetailsUpdateSchema = z
  .object({
    id: idSchema,
    location: nullableText(240),
    address: nullableText(500),
    email: nullableEmailSchema,
    phone: nullableText(50),
  })
  .strict();

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>;
export type ContactDetailsUpdateInput = z.infer<
  typeof contactDetailsUpdateSchema
>;

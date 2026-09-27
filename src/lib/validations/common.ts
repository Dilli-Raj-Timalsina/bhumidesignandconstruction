import { z } from "zod";

export const CONTENT_STATUSES = ["draft", "published"] as const;
export const CONTACT_MESSAGE_STATUSES = ["new", "read", "archived"] as const;

export const contentStatusSchema = z.enum(CONTENT_STATUSES);
export const contactMessageStatusSchema = z.enum(CONTACT_MESSAGE_STATUSES);
export const idSchema = z.string().uuid("A valid record id is required.");

const storagePathPattern =
  /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9][A-Za-z0-9._/-]*$/;
const publicAssetPathPattern =
  /^\/(?:brand|images)\/[A-Za-z0-9][A-Za-z0-9._/-]*$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function calendarDateIsValid(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function requiredText(label: string, maximumLength: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(
      maximumLength,
      `${label} must be ${maximumLength} characters or fewer.`,
    );
}

/** Converts blank optional form fields to null for database inserts and updates. */
export function nullableText(maximumLength: number) {
  return z
    .union([z.string().trim().max(maximumLength), z.null(), z.undefined()])
    .transform((value) =>
      typeof value === "string" && value.length > 0 ? value : null,
    );
}

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "A URL slug is required.")
  .max(160, "A URL slug must be 160 characters or fewer.")
  .regex(slugPattern, "Use lowercase words separated by single hyphens.");

export const nullableStoragePathSchema = nullableText(1024).refine(
  (value) =>
    value === null ||
    storagePathPattern.test(value) ||
    publicAssetPathPattern.test(value),
  "Use a Storage object path or an approved public asset path under /brand or /images.",
);

export const nullableDateSchema = z
  .union([
    z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date.")
      .refine(calendarDateIsValid, "Use a real calendar date."),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((value) =>
    typeof value === "string" && value.length > 0 ? value : null,
  );

export const nullablePublishedAtSchema = z
  .union([
    z.string().trim().datetime({ offset: true }),
    z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date or ISO timestamp.")
      .refine(calendarDateIsValid, "Use a real calendar date."),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (typeof value !== "string" || value.length === 0) return null;
    return value.length === 10 ? `${value}T00:00:00.000Z` : value;
  });

export const sortOrderSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce
    .number()
    .int("Display order must be a whole number.")
    .min(0)
    .max(100_000)
    .default(0),
);

export const nonNegativeIntegerSchema = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? null : value,
  z.union([
    z.coerce.number().int("Use a whole number.").min(0).max(1_000_000),
    z.null(),
  ]),
);

/** Accepts checkbox values from FormData as well as JSON booleans. */
export const checkboxSchema = z.preprocess((value) => {
  if (value === true || value === "true" || value === "on") return true;
  if (
    value === false ||
    value === "false" ||
    value === "" ||
    value === undefined ||
    value === null
  )
    return false;
  return value;
}, z.boolean());

export const nullableUuidSchema = z
  .union([
    z.string().uuid("Use a valid id."),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((value) =>
    typeof value === "string" && value.length > 0 ? value : null,
  );

export function nullableUrl(maximumLength = 2048) {
  return z
    .union([
      z
        .string()
        .trim()
        .url("Use a full URL including https://.")
        .refine(
          (value) => new URL(value).protocol === "https:",
          "Use an HTTPS URL.",
        )
        .max(maximumLength),
      z.literal(""),
      z.null(),
      z.undefined(),
    ])
    .transform((value) =>
      typeof value === "string" && value.length > 0 ? value : null,
    );
}

export function toFormObject(
  formData: FormData,
): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

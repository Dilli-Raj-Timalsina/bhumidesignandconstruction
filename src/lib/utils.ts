import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves a `media` Storage object key to a public URL without constructing a
 * Supabase client. It returns null in credential-free local development.
 */
export function getPublicStorageUrl(
  path: string | null | undefined,
  bucket = "media",
): string | null {
  const objectPath = path?.trim();
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

  if (!objectPath || !baseUrl || !bucket.trim()) return null;
  if (/^https?:\/\//i.test(objectPath)) return objectPath;

  try {
    new URL(baseUrl);
  } catch {
    return null;
  }

  const encodedPath = objectPath
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  if (!encodedPath) return null;
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket.trim())}/${encodedPath}`;
}

export function formatDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", options).format(date);
}

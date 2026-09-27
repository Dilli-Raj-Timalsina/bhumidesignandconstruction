import { cache } from "react";

import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/utils";

import type {
  PublicAlbumImage,
  PublicGalleryAlbum,
  PublicPost,
  PublicProject,
  PublicProjectImage,
  PublicService,
  SiteContent,
} from "./types";

type Row = Record<string, unknown>;

const fallbackSite: SiteContent = {
  companyName: "BHUMI DESIGN & CONSTRUCTION PVT. LTD.",
  shortName: "BHUMI",
  tagline: "Built with engineering. Delivered with precision.",
  description:
    "Civil engineering and construction solutions in Tulsipur, Dang, Nepal.",
  location: "Tulsipur, Dang, Nepal",
  address: null,
  email: null,
  phone: null,
  aboutTitle: null,
  aboutContent: null,
  logoImage: null,
  heroImage: null,
  aboutImage: null,
  socialLinks: {},
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function bool(value: unknown): boolean {
  return value === true;
}

function integer(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function nestedRows(value: unknown): Row[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Row => typeof item === "object" && item !== null,
      )
    : [];
}

function mapProjectImage(row: Row): PublicProjectImage | null {
  const image = getPublicStorageUrl(text(row.image_path));
  const id = text(row.id);
  if (!id || !image) return null;
  return {
    id,
    image,
    altText: text(row.alt_text),
    caption: text(row.caption),
    sortOrder: integer(row.sort_order),
  };
}

function mapProject(row: Row): PublicProject | null {
  const id = text(row.id);
  const title = text(row.title);
  const slug = text(row.slug);
  if (!id || !title || !slug) return null;
  return {
    id,
    title,
    slug,
    category: text(row.category),
    location: text(row.location),
    client: text(row.client),
    mainContractor: text(row.main_contractor),
    financing: text(row.financing),
    description: text(row.description),
    scopeOfWork: text(row.scope_of_work),
    executionDetails: text(row.execution_details),
    projectStatus: text(row.project_status),
    status: text(row.status) ?? "draft",
    startDate: text(row.start_date),
    completionDate: text(row.completion_date),
    manpower:
      typeof row.manpower === "number" && Number.isFinite(row.manpower)
        ? String(row.manpower)
        : null,
    featured: bool(row.featured),
    coverImage: getPublicStorageUrl(text(row.cover_image_path)),
    sortOrder: integer(row.sort_order),
    images: nestedRows(row.project_images)
      .map(mapProjectImage)
      .filter((image): image is PublicProjectImage => image !== null)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

function mapService(row: Row): PublicService | null {
  const id = text(row.id);
  const title = text(row.title);
  const slug = text(row.slug);
  if (!id || !title || !slug) return null;
  return {
    id,
    title,
    slug,
    shortDescription: text(row.short_description),
    description: text(row.description),
    coverImage: getPublicStorageUrl(text(row.cover_image_path)),
    icon: text(row.icon),
    featured: bool(row.featured),
    sortOrder: integer(row.sort_order),
  };
}

function mapAlbumImage(row: Row): PublicAlbumImage | null {
  const id = text(row.id);
  const image = getPublicStorageUrl(text(row.image_path));
  if (!id || !image) return null;
  return {
    id,
    image,
    altText: text(row.alt_text),
    caption: text(row.caption),
    sortOrder: integer(row.sort_order),
  };
}

function mapAlbum(row: Row): PublicGalleryAlbum | null {
  const id = text(row.id);
  const title = text(row.title);
  const slug = text(row.slug);
  if (!id || !title || !slug) return null;
  return {
    id,
    title,
    slug,
    description: text(row.description),
    coverImage: getPublicStorageUrl(text(row.cover_image_path)),
    category: text(row.category),
    featured: bool(row.featured),
    sortOrder: integer(row.sort_order),
    images: nestedRows(row.gallery_images)
      .map(mapAlbumImage)
      .filter((image): image is PublicAlbumImage => image !== null)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

function mapPost(row: Row): PublicPost | null {
  const id = text(row.id);
  const title = text(row.title);
  const slug = text(row.slug);
  if (!id || !title || !slug) return null;
  return {
    id,
    title,
    slug,
    excerpt: text(row.excerpt),
    coverImage: getPublicStorageUrl(text(row.cover_image_path)),
    content: text(row.content),
    category: text(row.category),
    tags: stringArray(row.tags),
    author: text(row.author),
    status: text(row.status) ?? "draft",
    publishedAt: text(row.published_at),
    seoTitle: text(row.seo_title),
    seoDescription: text(row.seo_description),
  };
}

function mapSite(row: Row | null): SiteContent {
  if (!row) return fallbackSite;
  const social = row.social_links;
  return {
    companyName: text(row.company_name) ?? fallbackSite.companyName,
    shortName: text(row.short_name) ?? fallbackSite.shortName,
    tagline: text(row.tagline) ?? fallbackSite.tagline,
    description: text(row.description) ?? fallbackSite.description,
    location: text(row.location) ?? fallbackSite.location,
    address: text(row.address),
    email: text(row.email),
    phone: text(row.phone),
    aboutTitle: text(row.about_title),
    aboutContent: text(row.about_content),
    logoImage: getPublicStorageUrl(text(row.logo_path)),
    heroImage: getPublicStorageUrl(text(row.hero_image_path)),
    aboutImage: getPublicStorageUrl(text(row.about_image_path)),
    socialLinks:
      typeof social === "object" && social !== null && !Array.isArray(social)
        ? Object.fromEntries(
            Object.entries(social).filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === "string",
            ),
          )
        : {},
  };
}

async function attempt<T>(work: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await work();
  } catch {
    return fallback;
  }
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!hasSupabaseEnv()) return fallbackSite;
  return attempt(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) return fallbackSite;
    return mapSite(data as unknown as Row | null);
  }, fallbackSite);
});

export async function getProjects(limit?: number): Promise<PublicProject[]> {
  if (!hasSupabaseEnv()) return [];
  return attempt(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("projects")
      .select("*, project_images(*)")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? [])
      .map((row) => mapProject(row as unknown as Row))
      .filter((project): project is PublicProject => project !== null);
  }, []);
}

export async function getFeaturedProject(): Promise<PublicProject | null> {
  const projects = await getProjects();
  return projects.find((project) => project.featured) ?? projects[0] ?? null;
}

export async function getProjectBySlug(
  slug: string,
): Promise<PublicProject | null> {
  if (!hasSupabaseEnv()) return null;
  return attempt(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, project_images(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return mapProject(data as unknown as Row);
  }, null);
}

export async function getServices(limit?: number): Promise<PublicService[]> {
  if (!hasSupabaseEnv()) return [];
  return attempt(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("services")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? [])
      .map((row) => mapService(row as unknown as Row))
      .filter((service): service is PublicService => service !== null);
  }, []);
}

export async function getGalleryAlbums(
  limit?: number,
): Promise<PublicGalleryAlbum[]> {
  if (!hasSupabaseEnv()) return [];
  return attempt(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("gallery_albums")
      .select("*, gallery_images(*)")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? [])
      .map((row) => mapAlbum(row as unknown as Row))
      .filter((album): album is PublicGalleryAlbum => album !== null);
  }, []);
}

export async function getPosts(limit?: number): Promise<PublicPost[]> {
  if (!hasSupabaseEnv()) return [];
  return attempt(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? [])
      .map((row) => mapPost(row as unknown as Row))
      .filter((post): post is PublicPost => post !== null);
  }, []);
}

export async function getPostBySlug(slug: string): Promise<PublicPost | null> {
  if (!hasSupabaseEnv()) return null;
  return attempt(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return mapPost(data as unknown as Row);
  }, null);
}

export function getAllGalleryImages(albums: PublicGalleryAlbum[]) {
  return albums
    .flatMap((album) =>
      album.images.map((image) => ({ ...image, albumTitle: album.title })),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

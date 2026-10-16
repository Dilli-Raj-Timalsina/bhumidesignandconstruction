import { cache } from "react";
import { unstable_cache } from "next/cache";

import { hasSupabaseEnv } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicStorageUrl } from "@/lib/utils";

import {
  fallbackItems,
  portfolioFallbackGalleryAlbums,
  portfolioFallbackPosts,
  portfolioFallbackProjects,
  portfolioFallbackServices,
  portfolioFallbackSite,
} from "./portfolio";
import { resolveHeroImagePath } from "./hero-image";
import { readEditorialContent } from "./editorial";
import { readPageIntros } from "./page-intros";
import { readProjectStage } from "./project-stage";
import { publicContentRevalidateSeconds, publicContentTags } from "./cache";
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

const fallbackSite = portfolioFallbackSite;

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
    stage: readProjectStage(row.stage),
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

function mapSite(input: Row | null): SiteContent {
  const row = input ?? {};
  const social = row.social_links;
  return {
    companyName: text(row.company_name) ?? fallbackSite.companyName,
    shortName: text(row.short_name) ?? fallbackSite.shortName,
    tagline: text(row.tagline),
    description: text(row.description),
    location: text(row.location),
    address: text(row.address),
    email: text(row.email),
    phone: text(row.phone),
    aboutTitle: text(row.about_title),
    aboutContent: text(row.about_content),
    logoImage: getPublicStorageUrl(text(row.logo_path)),
    heroTitle: text(row.hero_title),
    heroDescription: text(row.hero_description),
    heroImage: getPublicStorageUrl(
      resolveHeroImagePath(text(row.hero_image_path)),
    ),
    heroImageAlt: text(row.hero_image_alt),
    aboutImage: getPublicStorageUrl(text(row.about_image_path)),
    aboutImageAlt: text(row.about_image_alt),
    highlightsImage:
      "highlights_image_path" in row
        ? getPublicStorageUrl(text(row.highlights_image_path))
        : "/images/marketing/rebar-background.jpg",
    editorial: readEditorialContent(row.editorial_content),
    pageIntros: readPageIntros(row.page_intros),
    socialLinks:
      typeof social === "object" && social !== null && !Array.isArray(social)
        ? Object.fromEntries(
            Object.entries(social).filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === "string",
            ),
          )
        : {},
    defaultSeoTitle: text(row.default_seo_title),
    defaultSeoDescription: text(row.default_seo_description),
  };
}

const readSiteContent = unstable_cache(
  async (): Promise<SiteContent> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("settings_key", "default")
      .maybeSingle();
    if (error) throw new Error("Unable to load public site settings.");
    return mapSite(data as unknown as Row | null);
  },
  ["public-site-content"],
  {
    tags: [publicContentTags.site],
    revalidate: publicContentRevalidateSeconds,
  },
);

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  return hasSupabaseEnv() ? readSiteContent() : fallbackSite;
});

const readProjects = unstable_cache(
  async (): Promise<PublicProject[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, project_images(*)")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) throw new Error("Unable to load public projects.");
    return (data ?? [])
      .map((row) => mapProject(row as unknown as Row))
      .filter((project): project is PublicProject => project !== null);
  },
  ["public-projects"],
  {
    tags: [publicContentTags.projects],
    revalidate: publicContentRevalidateSeconds,
  },
);

export async function getProjects(limit?: number): Promise<PublicProject[]> {
  const projects = hasSupabaseEnv()
    ? await readProjects()
    : portfolioFallbackProjects;
  return fallbackItems(projects, limit);
}

export async function getFeaturedProject(): Promise<PublicProject | null> {
  const projects = await getProjects();
  return projects.find((project) => project.featured) ?? projects[0] ?? null;
}

export async function getProjectBySlug(
  slug: string,
): Promise<PublicProject | null> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

const readServices = unstable_cache(
  async (): Promise<PublicService[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) throw new Error("Unable to load public services.");
    return (data ?? [])
      .map((row) => mapService(row as unknown as Row))
      .filter((service): service is PublicService => service !== null);
  },
  ["public-services"],
  {
    tags: [publicContentTags.services],
    revalidate: publicContentRevalidateSeconds,
  },
);

export async function getServices(limit?: number): Promise<PublicService[]> {
  const services = hasSupabaseEnv()
    ? await readServices()
    : portfolioFallbackServices;
  return fallbackItems(services, limit);
}

const readGalleryAlbums = unstable_cache(
  async (): Promise<PublicGalleryAlbum[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("gallery_albums")
      .select("*, gallery_images(*)")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error) throw new Error("Unable to load public gallery albums.");
    return (data ?? [])
      .map((row) => mapAlbum(row as unknown as Row))
      .filter((album): album is PublicGalleryAlbum => album !== null);
  },
  ["public-gallery"],
  {
    tags: [publicContentTags.gallery],
    revalidate: publicContentRevalidateSeconds,
  },
);

export async function getGalleryAlbums(
  limit?: number,
): Promise<PublicGalleryAlbum[]> {
  const albums = hasSupabaseEnv()
    ? await readGalleryAlbums()
    : portfolioFallbackGalleryAlbums;
  return fallbackItems(albums, limit);
}

const readPosts = unstable_cache(
  async (): Promise<PublicPost[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw new Error("Unable to load public insights.");
    return (data ?? [])
      .map((row) => mapPost(row as unknown as Row))
      .filter((post): post is PublicPost => post !== null);
  },
  ["public-posts"],
  {
    tags: [publicContentTags.posts],
    revalidate: publicContentRevalidateSeconds,
  },
);

export async function getPosts(limit?: number): Promise<PublicPost[]> {
  const posts = hasSupabaseEnv() ? await readPosts() : portfolioFallbackPosts;
  return fallbackItems(posts, limit);
}

export async function getPostBySlug(slug: string): Promise<PublicPost | null> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export function getAllGalleryImages(albums: PublicGalleryAlbum[]) {
  return albums
    .flatMap((album) =>
      album.images.map((image) => ({ ...image, albumTitle: album.title })),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

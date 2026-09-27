import { createClient } from "@/lib/supabase/server";

type Row = Record<string, unknown>;

function rows(value: unknown): Row[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Row => typeof item === "object" && item !== null,
      )
    : [];
}

function row(value: unknown): Row | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Row)
    : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function requiredText(value: unknown): string {
  return text(value) ?? "";
}

function number(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function boolean(value: unknown): boolean {
  return value === true;
}

function tags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export type AdminProject = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  location: string | null;
  client: string | null;
  mainContractor: string | null;
  financing: string | null;
  description: string | null;
  scopeOfWork: string | null;
  executionDetails: string | null;
  projectStatus: string | null;
  status: string;
  publishedAt: string | null;
  startDate: string | null;
  completionDate: string | null;
  manpower: string | null;
  featured: boolean;
  coverImagePath: string | null;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string | null;
};

export type AdminService = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  coverImagePath: string | null;
  icon: string | null;
  featured: boolean;
  sortOrder: number;
  status: string;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type AdminAlbum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImagePath: string | null;
  category: string | null;
  featured: boolean;
  sortOrder: number;
  status: string;
  publishedAt: string | null;
};

export type AdminImage = {
  id: string;
  imagePath: string;
  caption: string | null;
  altText: string | null;
  sortOrder: number;
};

export type AdminPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImagePath: string | null;
  content: string | null;
  category: string | null;
  tags: string[];
  author: string | null;
  authorId: string | null;
  status: string;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string | null;
};

export type AdminSettings = {
  id: string | null;
  companyName: string;
  shortName: string;
  tagline: string | null;
  description: string | null;
  address: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  logoPath: string | null;
  heroTitle: string | null;
  heroDescription: string | null;
  heroImagePath: string | null;
  aboutImagePath: string | null;
  aboutTitle: string | null;
  aboutContent: string | null;
  socialLinks: Record<string, string>;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
};

function project(source: Row): AdminProject {
  return {
    id: requiredText(source.id),
    title: requiredText(source.title),
    slug: requiredText(source.slug),
    category: text(source.category),
    location: text(source.location),
    client: text(source.client),
    mainContractor: text(source.main_contractor),
    financing: text(source.financing),
    description: text(source.description),
    scopeOfWork: text(source.scope_of_work),
    executionDetails: text(source.execution_details),
    projectStatus: text(source.project_status),
    status: text(source.status) ?? "draft",
    publishedAt: text(source.published_at),
    startDate: text(source.start_date),
    completionDate: text(source.completion_date),
    manpower:
      typeof source.manpower === "number" && Number.isFinite(source.manpower)
        ? String(source.manpower)
        : null,
    featured: boolean(source.featured),
    coverImagePath: text(source.cover_image_path),
    sortOrder: number(source.sort_order),
    seoTitle: text(source.seo_title),
    seoDescription: text(source.seo_description),
    createdAt: text(source.created_at),
  };
}

function service(source: Row): AdminService {
  return {
    id: requiredText(source.id),
    title: requiredText(source.title),
    slug: requiredText(source.slug),
    shortDescription: text(source.short_description),
    description: text(source.description),
    coverImagePath: text(source.cover_image_path),
    icon: text(source.icon),
    featured: boolean(source.featured),
    sortOrder: number(source.sort_order),
    status: text(source.status) ?? "draft",
    publishedAt: text(source.published_at),
    seoTitle: text(source.seo_title),
    seoDescription: text(source.seo_description),
  };
}

function album(source: Row): AdminAlbum {
  return {
    id: requiredText(source.id),
    title: requiredText(source.title),
    slug: requiredText(source.slug),
    description: text(source.description),
    coverImagePath: text(source.cover_image_path),
    category: text(source.category),
    featured: boolean(source.featured),
    sortOrder: number(source.sort_order),
    status: text(source.status) ?? "draft",
    publishedAt: text(source.published_at),
  };
}

function image(source: Row): AdminImage {
  return {
    id: requiredText(source.id),
    imagePath: requiredText(source.image_path),
    caption: text(source.caption),
    altText: text(source.alt_text),
    sortOrder: number(source.sort_order),
  };
}

function post(source: Row): AdminPost {
  return {
    id: requiredText(source.id),
    title: requiredText(source.title),
    slug: requiredText(source.slug),
    excerpt: text(source.excerpt),
    coverImagePath: text(source.cover_image_path),
    content: text(source.content),
    category: text(source.category),
    tags: tags(source.tags),
    author: text(source.author),
    authorId: text(source.author_id),
    status: text(source.status) ?? "draft",
    publishedAt: text(source.published_at),
    seoTitle: text(source.seo_title),
    seoDescription: text(source.seo_description),
  };
}

function message(source: Row): AdminMessage {
  return {
    id: requiredText(source.id),
    name: requiredText(source.name),
    email: requiredText(source.email),
    phone: text(source.phone),
    subject: text(source.subject),
    message: requiredText(source.message),
    status: text(source.status) ?? "new",
    createdAt: text(source.created_at),
  };
}

export async function getAdminProjects(
  search?: string,
): Promise<AdminProject[]> {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  if (search?.trim()) query = query.ilike("title", `%${search.trim()}%`);
  const { data, error } = await query;
  fail(error);
  return rows(data)
    .map(project)
    .filter((item) => item.id && item.title);
}

export async function getAdminProject(
  id: string,
): Promise<AdminProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  fail(error);
  const item = row(data);
  return item ? project(item) : null;
}

export async function getProjectImages(
  projectId: string,
): Promise<AdminImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  fail(error);
  return rows(data)
    .map(image)
    .filter((item) => item.id && item.imagePath);
}

export async function getAdminServices(
  search?: string,
): Promise<AdminService[]> {
  const supabase = await createClient();
  let query = supabase
    .from("services")
    .select("*")
    .order("updated_at", { ascending: false });
  if (search?.trim()) query = query.ilike("title", `%${search.trim()}%`);
  const { data, error } = await query;
  fail(error);
  return rows(data)
    .map(service)
    .filter((item) => item.id && item.title);
}

export async function getAdminService(
  id: string,
): Promise<AdminService | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  fail(error);
  const item = row(data);
  return item ? service(item) : null;
}

export async function getAdminAlbums(search?: string): Promise<AdminAlbum[]> {
  const supabase = await createClient();
  let query = supabase
    .from("gallery_albums")
    .select("*")
    .order("updated_at", { ascending: false });
  if (search?.trim()) query = query.ilike("title", `%${search.trim()}%`);
  const { data, error } = await query;
  fail(error);
  return rows(data)
    .map(album)
    .filter((item) => item.id && item.title);
}

export async function getAdminAlbum(id: string): Promise<AdminAlbum | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  fail(error);
  const item = row(data);
  return item ? album(item) : null;
}

export async function getAlbumImages(albumId: string): Promise<AdminImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order");
  fail(error);
  return rows(data)
    .map(image)
    .filter((item) => item.id && item.imagePath);
}

export async function getAdminPosts(search?: string): Promise<AdminPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (search?.trim()) query = query.ilike("title", `%${search.trim()}%`);
  const { data, error } = await query;
  fail(error);
  return rows(data)
    .map(post)
    .filter((item) => item.id && item.title);
}

export async function getAdminPost(id: string): Promise<AdminPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  fail(error);
  const item = row(data);
  return item ? post(item) : null;
}

export async function getAdminMessages(
  search?: string,
): Promise<AdminMessage[]> {
  const supabase = await createClient();
  let query = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (search?.trim())
    query = query.or(
      `name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,subject.ilike.%${search.trim()}%`,
    );
  const { data, error } = await query;
  fail(error);
  return rows(data)
    .map(message)
    .filter((item) => item.id && item.email);
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  fail(error);
  const source = row(data);
  const links = source?.social_links;
  const socialLinks =
    typeof links === "object" && links !== null && !Array.isArray(links)
      ? Object.fromEntries(
          Object.entries(links).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : {};
  return {
    id: source ? text(source.id) : null,
    companyName: source ? requiredText(source.company_name) : "",
    shortName: source ? requiredText(source.short_name) : "",
    tagline: source ? text(source.tagline) : null,
    description: source ? text(source.description) : null,
    address: source ? text(source.address) : null,
    location: source ? text(source.location) : null,
    email: source ? text(source.email) : null,
    phone: source ? text(source.phone) : null,
    logoPath: source ? text(source.logo_path) : null,
    heroTitle: source ? text(source.hero_title) : null,
    heroDescription: source ? text(source.hero_description) : null,
    heroImagePath: source ? text(source.hero_image_path) : null,
    aboutImagePath: source ? text(source.about_image_path) : null,
    aboutTitle: source ? text(source.about_title) : null,
    aboutContent: source ? text(source.about_content) : null,
    socialLinks,
    defaultSeoTitle: source ? text(source.default_seo_title) : null,
    defaultSeoDescription: source ? text(source.default_seo_description) : null,
  };
}

export async function getDashboardCounts(): Promise<{
  projects: number;
  images: number;
  messages: number;
}> {
  const supabase = await createClient();
  const [projects, projectImages, galleryImages, messages] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("project_images")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("gallery_images")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);
  fail(projects.error);
  fail(projectImages.error);
  fail(galleryImages.error);
  fail(messages.error);
  return {
    projects: projects.count ?? 0,
    images: (projectImages.count ?? 0) + (galleryImages.count ?? 0),
    messages: messages.count ?? 0,
  };
}

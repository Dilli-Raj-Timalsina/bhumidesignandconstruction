"use server";

import sanitizeHtml from "sanitize-html";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/components/admin/require-admin";
import {
  getConfiguredAdminCredentials,
  hasConfiguredAdminCredentials,
  isConfiguredAdminEmail,
} from "@/lib/admin/config";
import { matchesConfiguredAdminCredentials } from "@/lib/admin/credentials";
import {
  clearAdminLoginAttempts,
  consumeAdminLoginAttempt,
  type AdminLoginAttempt,
} from "@/lib/admin/login-rate-limit";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import {
  galleryAlbumSchema,
  galleryAlbumUpdateSchema,
  galleryImageSchema,
  galleryImageUpdateSchema,
  contactDetailsUpdateSchema,
  contactMessageStatusUpdateSchema,
  idSchema,
  postSchema,
  postUpdateSchema,
  projectImageSchema,
  projectImageUpdateSchema,
  projectSchema,
  projectUpdateSchema,
  serviceSchema,
  serviceUpdateSchema,
  siteSettingsSchema,
  siteSettingsUpdateSchema,
  toFormObject,
} from "@/lib/validations";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ActionResult = {
  ok: boolean;
  message: string;
  path?: string;
  url?: string;
};

const mediaBucket = "media";
const maximumUploadBytes = 8 * 1024 * 1024;
const acceptedImages = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
const uploadFolders = new Set([
  "gallery",
  "posts",
  "projects",
  "services",
  "site",
  "uploads",
]);
const adminPathPattern = /^\/admin(?:\/[A-Za-z0-9._~-]+)*$/;

function matchesBytes(
  bytes: Uint8Array,
  signature: readonly number[],
  offset = 0,
): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function containsAscii(bytes: Uint8Array, value: string, offset = 0): boolean {
  const signature = Array.from(value, (character) => character.charCodeAt(0));
  for (
    let index = offset;
    index <= bytes.length - signature.length;
    index += 1
  ) {
    if (matchesBytes(bytes, signature, index)) return true;
  }
  return false;
}

/**
 * Browsers can forge a file MIME type. Check the leading bytes before placing
 * an upload in the public media bucket as a second, server-side control.
 */
async function hasMatchingImageSignature(file: File): Promise<boolean> {
  try {
    const bytes = new Uint8Array(await file.slice(0, 64).arrayBuffer());
    if (file.type === "image/jpeg")
      return matchesBytes(bytes, [0xff, 0xd8, 0xff]);
    if (file.type === "image/png")
      return matchesBytes(
        bytes,
        [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      );
    if (file.type === "image/webp")
      return (
        matchesBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        matchesBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
      );
    if (file.type === "image/avif")
      return (
        matchesBytes(bytes, [0x66, 0x74, 0x79, 0x70], 4) &&
        (containsAscii(bytes, "avif", 8) || containsAscii(bytes, "avis", 8))
      );
  } catch {
    return false;
  }
  return false;
}

function safeAdminNext(value: FormDataEntryValue | null): string {
  if (
    typeof value !== "string" ||
    !adminPathPattern.test(value) ||
    value.includes("\\") ||
    value.split("/").some((segment) => segment === "." || segment === "..") ||
    value === "/admin/login"
  ) {
    return "/admin/dashboard";
  }
  return value;
}

function loginRedirect(
  reason: "configuration" | "credentials" | "rate_limited" | "unavailable",
  next: FormDataEntryValue | null,
): never {
  const search = new URLSearchParams({
    reason,
    next: safeAdminNext(next),
  });
  redirect(`/admin/login?${search.toString()}`);
}

function noticePath(
  path: string,
  key: "error" | "notice",
  message: string,
): string {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(message)}`;
}

function validationMessage(issues: { message: string }[]): string {
  return issues[0]?.message ?? "Check the form fields and try again.";
}

function errorRedirect(path: string, message: string): never {
  redirect(noticePath(path, "error", message));
}

function successRedirect(path: string, message: string): never {
  redirect(noticePath(path, "notice", message));
}

function formRecord(formData: FormData) {
  return toFormObject(formData);
}

function revalidateContent(
  kind: "projects" | "services" | "gallery" | "posts",
  slug?: string,
) {
  revalidatePath("/");
  if (kind === "projects") {
    revalidatePath("/projects");
    revalidatePath("/projects/[slug]", "page");
    if (slug) revalidatePath(`/projects/${slug}`);
  }
  if (kind === "services") revalidatePath("/services");
  if (kind === "gallery") revalidatePath("/gallery");
  if (kind === "posts") {
    revalidatePath("/insights");
    revalidatePath("/insights/[slug]", "page");
    if (slug) revalidatePath(`/insights/${slug}`);
  }
}

function sanitizePostHtml(content: string | null): string | null {
  if (!content) return null;
  const clean = sanitizeHtml(content, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "strong",
      "em",
      "s",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href"],
      img: ["src", "alt", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: (() => {
          const attribs: Record<string, string> = {};
          if (attributes.href) {
            attribs.href = attributes.href;
            attribs.rel = "noopener noreferrer";
          }
          return attribs;
        })(),
      }),
      img: (_tagName, attributes) => ({
        tagName: "img",
        attribs: {
          ...(attributes.src ? { src: attributes.src } : {}),
          ...(attributes.alt ? { alt: attributes.alt } : {}),
          loading: "lazy",
        },
      }),
    },
  }).trim();
  return clean || null;
}

function revalidateSettings() {
  revalidatePath("/", "layout");
}

async function deleteMediaPathIfUnused(
  client: SupabaseClient<Database>,
  path: string | null | undefined,
) {
  if (!path) return;
  const checks = await Promise.all([
    client
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("cover_image_path", path),
    client
      .from("project_images")
      .select("id", { count: "exact", head: true })
      .eq("image_path", path),
    client
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("cover_image_path", path),
    client
      .from("gallery_albums")
      .select("id", { count: "exact", head: true })
      .eq("cover_image_path", path),
    client
      .from("gallery_images")
      .select("id", { count: "exact", head: true })
      .eq("image_path", path),
    client
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("cover_image_path", path),
    client
      .from("site_settings")
      .select("id", { count: "exact", head: true })
      .eq("logo_path", path),
    client
      .from("site_settings")
      .select("id", { count: "exact", head: true })
      .eq("hero_image_path", path),
    client
      .from("site_settings")
      .select("id", { count: "exact", head: true })
      .eq("about_image_path", path),
  ]);

  if (checks.some((result) => result.error || (result.count ?? 0) > 0)) return;
  await client.storage.from(mediaBucket).remove([path]);
}

async function deleteProjectMedia(
  client: SupabaseClient<Database>,
  id: string,
) {
  const [{ data: project }, { data: images }] = await Promise.all([
    client
      .from("projects")
      .select("cover_image_path")
      .eq("id", id)
      .maybeSingle(),
    client.from("project_images").select("image_path").eq("project_id", id),
  ]);
  const paths = [
    project?.cover_image_path,
    ...(images ?? []).map((image) => image.image_path),
  ];
  const { error } = await client.from("projects").delete().eq("id", id);
  if (error) return error;
  await Promise.all(paths.map((path) => deleteMediaPathIfUnused(client, path)));
  return null;
}

async function deleteAlbumMedia(client: SupabaseClient<Database>, id: string) {
  const [{ data: album }, { data: images }] = await Promise.all([
    client
      .from("gallery_albums")
      .select("cover_image_path")
      .eq("id", id)
      .maybeSingle(),
    client.from("gallery_images").select("image_path").eq("album_id", id),
  ]);
  const paths = [
    album?.cover_image_path,
    ...(images ?? []).map((image) => image.image_path),
  ];
  const { error } = await client.from("gallery_albums").delete().eq("id", id);
  if (error) return error;
  await Promise.all(paths.map((path) => deleteMediaPathIfUnused(client, path)));
  return null;
}

export async function loginAction(formData: FormData) {
  if (!hasSupabaseEnv() || !hasConfiguredAdminCredentials()) {
    loginRedirect("configuration", formData.get("next"));
  }

  const email = formData.get("email");
  const password = formData.get("password");
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    loginRedirect("credentials", formData.get("next"));
  }

  const next = formData.get("next");
  const normalizedEmail = email.trim().toLowerCase();
  const configured = getConfiguredAdminCredentials();
  let attempt: AdminLoginAttempt;
  try {
    attempt = await consumeAdminLoginAttempt(normalizedEmail, configured);
  } catch {
    // Fail closed if the durable limiter cannot be reached.
    loginRedirect("unavailable", next);
  }

  if (!attempt.allowed) loginRedirect("rate_limited", next);
  if (
    !matchesConfiguredAdminCredentials(normalizedEmail, password, configured)
  ) {
    loginRedirect("credentials", next);
  }

  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: configured.email,
      password: configured.password,
    });
    if (error || !data.user)
      throw new Error("Configured admin sign-in failed.");

    const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");
    if (
      roleError ||
      isAdmin !== true ||
      !data.user.email_confirmed_at ||
      !isConfiguredAdminEmail(data.user.email)
    ) {
      throw new Error("Configured administrator is not synchronized.");
    }
  } catch {
    if (supabase) await supabase.auth.signOut();
    loginRedirect("unavailable", next);
  }

  try {
    await clearAdminLoginAttempts(attempt.subjects);
  } catch {
    await supabase.auth.signOut();
    loginRedirect("unavailable", next);
  }

  redirect(safeAdminNext(next));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function uploadImageAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const file = formData.get("file");
  const requestedFolder = formData.get("folder");
  if (!(file instanceof File))
    return { ok: false, message: "Choose an image file to upload." };
  if (!acceptedImages.has(file.type))
    return {
      ok: false,
      message: "Only JPEG, PNG, WebP, and AVIF images are supported.",
    };
  if (file.size === 0 || file.size > maximumUploadBytes)
    return { ok: false, message: "Image files must be 8 MB or smaller." };
  if (!(await hasMatchingImageSignature(file)))
    return {
      ok: false,
      message: "The file contents do not match the selected image type.",
    };

  const folder =
    typeof requestedFolder === "string" && uploadFolders.has(requestedFolder)
      ? requestedFolder
      : "uploads";
  const extension = acceptedImages.get(file.type);
  if (!extension) return { ok: false, message: "Unsupported image file type." };
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(mediaBucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error)
    return {
      ok: false,
      message: "The image could not be uploaded. Please try again.",
    };
  const { data } = supabase.storage.from(mediaBucket).getPublicUrl(path);
  return { ok: true, message: "Image uploaded.", path, url: data.publicUrl };
}

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = projectSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(
      "/admin/projects/new",
      validationMessage(parsed.error.issues),
    );
  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert(parsed.data);
  if (error)
    errorRedirect(
      "/admin/projects/new",
      "The project could not be created. Check that its slug is unique.",
    );
  revalidateContent("projects", parsed.data.slug);
  successRedirect("/admin/projects", "Project created.");
}

export async function updateProjectAction(formData: FormData) {
  await requireAdmin();
  const rawId = formData.get("id");
  const fallbackPath =
    typeof rawId === "string"
      ? `/admin/projects/${encodeURIComponent(rawId)}`
      : "/admin/projects";
  const parsed = projectUpdateSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(fallbackPath, validationMessage(parsed.error.issues));
  const { id, ...updates } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id);
  if (error)
    errorRedirect(
      fallbackPath,
      "The project could not be saved. Check that its slug is unique.",
    );
  revalidateContent("projects", updates.slug);
  successRedirect(`/admin/projects/${id}`, "Project saved.");
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success)
    errorRedirect("/admin/projects", "The project could not be identified.");
  const supabase = await createClient();
  const error = await deleteProjectMedia(supabase, parsed.data);
  if (error)
    errorRedirect("/admin/projects", "The project could not be deleted.");
  revalidateContent("projects");
  successRedirect("/admin/projects", "Project deleted.");
}

export async function createProjectImageAction(formData: FormData) {
  await requireAdmin();
  const rawProjectId = formData.get("project_id");
  const fallbackPath =
    typeof rawProjectId === "string"
      ? `/admin/projects/${encodeURIComponent(rawProjectId)}`
      : "/admin/projects";
  const parsed = projectImageSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(fallbackPath, validationMessage(parsed.error.issues));
  const supabase = await createClient();
  const { error } = await supabase.from("project_images").insert(parsed.data);
  if (error) errorRedirect(fallbackPath, "The image could not be added.");
  revalidateContent("projects");
  successRedirect(fallbackPath, "Project image added.");
}

export async function updateProjectImageAction(formData: FormData) {
  await requireAdmin();
  const rawProjectId = formData.get("project_id");
  const fallbackPath =
    typeof rawProjectId === "string"
      ? `/admin/projects/${encodeURIComponent(rawProjectId)}`
      : "/admin/projects";
  const parsed = projectImageUpdateSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(fallbackPath, validationMessage(parsed.error.issues));
  const { id, project_id: _projectId, ...updates } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_images")
    .update(updates)
    .eq("id", id);
  if (error) errorRedirect(fallbackPath, "The image could not be saved.");
  revalidateContent("projects");
  successRedirect(fallbackPath, "Project image saved.");
}

export async function deleteProjectImageAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  const projectId = idSchema.safeParse(formData.get("project_id"));
  if (!id.success || !projectId.success)
    errorRedirect("/admin/projects", "The image could not be identified.");
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("project_images")
    .select("image_path")
    .eq("id", id.data)
    .maybeSingle();
  const { error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", id.data);
  if (error)
    errorRedirect(
      `/admin/projects/${projectId.data}`,
      "The image could not be deleted.",
    );
  await deleteMediaPathIfUnused(supabase, existing?.image_path);
  revalidateContent("projects");
  successRedirect(
    `/admin/projects/${projectId.data}`,
    "Project image deleted.",
  );
}

export async function createServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(
      "/admin/services/new",
      validationMessage(parsed.error.issues),
    );
  const supabase = await createClient();
  const { error } = await supabase.from("services").insert(parsed.data);
  if (error)
    errorRedirect(
      "/admin/services/new",
      "The service could not be created. Check that its slug is unique.",
    );
  revalidateContent("services");
  successRedirect("/admin/services", "Service created.");
}

export async function updateServiceAction(formData: FormData) {
  await requireAdmin();
  const rawId = formData.get("id");
  const fallbackPath =
    typeof rawId === "string"
      ? `/admin/services/${encodeURIComponent(rawId)}`
      : "/admin/services";
  const parsed = serviceUpdateSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(fallbackPath, validationMessage(parsed.error.issues));
  const { id, ...updates } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id);
  if (error)
    errorRedirect(
      fallbackPath,
      "The service could not be saved. Check that its slug is unique.",
    );
  revalidateContent("services");
  successRedirect(`/admin/services/${id}`, "Service saved.");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success)
    errorRedirect("/admin/services", "The service could not be identified.");
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("services")
    .select("cover_image_path")
    .eq("id", parsed.data)
    .maybeSingle();
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", parsed.data);
  if (error)
    errorRedirect("/admin/services", "The service could not be deleted.");
  await deleteMediaPathIfUnused(supabase, existing?.cover_image_path);
  revalidateContent("services");
  successRedirect("/admin/services", "Service deleted.");
}

export async function createGalleryAlbumAction(formData: FormData) {
  await requireAdmin();
  const parsed = galleryAlbumSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect("/admin/gallery/new", validationMessage(parsed.error.issues));
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_albums").insert(parsed.data);
  if (error)
    errorRedirect(
      "/admin/gallery/new",
      "The album could not be created. Check that its slug is unique.",
    );
  revalidateContent("gallery");
  successRedirect("/admin/gallery", "Gallery album created.");
}

export async function updateGalleryAlbumAction(formData: FormData) {
  await requireAdmin();
  const rawId = formData.get("id");
  const fallbackPath =
    typeof rawId === "string"
      ? `/admin/gallery/${encodeURIComponent(rawId)}`
      : "/admin/gallery";
  const parsed = galleryAlbumUpdateSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(fallbackPath, validationMessage(parsed.error.issues));
  const { id, ...updates } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_albums")
    .update(updates)
    .eq("id", id);
  if (error)
    errorRedirect(
      fallbackPath,
      "The album could not be saved. Check that its slug is unique.",
    );
  revalidateContent("gallery");
  successRedirect(`/admin/gallery/${id}`, "Gallery album saved.");
}

export async function deleteGalleryAlbumAction(formData: FormData) {
  await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success)
    errorRedirect("/admin/gallery", "The album could not be identified.");
  const supabase = await createClient();
  const error = await deleteAlbumMedia(supabase, parsed.data);
  if (error) errorRedirect("/admin/gallery", "The album could not be deleted.");
  revalidateContent("gallery");
  successRedirect("/admin/gallery", "Gallery album deleted.");
}

export async function createGalleryImageAction(formData: FormData) {
  await requireAdmin();
  const rawAlbumId = formData.get("album_id");
  const fallbackPath =
    typeof rawAlbumId === "string"
      ? `/admin/gallery/${encodeURIComponent(rawAlbumId)}`
      : "/admin/gallery";
  const parsed = galleryImageSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(fallbackPath, validationMessage(parsed.error.issues));
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").insert(parsed.data);
  if (error) errorRedirect(fallbackPath, "The image could not be added.");
  revalidateContent("gallery");
  successRedirect(fallbackPath, "Gallery image added.");
}

export async function updateGalleryImageAction(formData: FormData) {
  await requireAdmin();
  const rawAlbumId = formData.get("album_id");
  const fallbackPath =
    typeof rawAlbumId === "string"
      ? `/admin/gallery/${encodeURIComponent(rawAlbumId)}`
      : "/admin/gallery";
  const parsed = galleryImageUpdateSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(fallbackPath, validationMessage(parsed.error.issues));
  const { id, album_id: _albumId, ...updates } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_images")
    .update(updates)
    .eq("id", id);
  if (error) errorRedirect(fallbackPath, "The image could not be saved.");
  revalidateContent("gallery");
  successRedirect(fallbackPath, "Gallery image saved.");
}

export async function deleteGalleryImageAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  const albumId = idSchema.safeParse(formData.get("album_id"));
  if (!id.success || !albumId.success)
    errorRedirect("/admin/gallery", "The image could not be identified.");
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("gallery_images")
    .select("image_path")
    .eq("id", id.data)
    .maybeSingle();
  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", id.data);
  if (error)
    errorRedirect(
      `/admin/gallery/${albumId.data}`,
      "The image could not be deleted.",
    );
  await deleteMediaPathIfUnused(supabase, existing?.image_path);
  revalidateContent("gallery");
  successRedirect(`/admin/gallery/${albumId.data}`, "Gallery image deleted.");
}

export async function createPostAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = postSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect("/admin/posts/new", validationMessage(parsed.error.issues));
  const content = sanitizePostHtml(parsed.data.content);
  if (parsed.data.content && !content)
    errorRedirect(
      "/admin/posts/new",
      "Article content must include supported text or media.",
    );
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .insert({ ...parsed.data, content, author_id: admin.id });
  if (error)
    errorRedirect(
      "/admin/posts/new",
      "The article could not be created. Check that its slug is unique.",
    );
  revalidateContent("posts", parsed.data.slug);
  successRedirect("/admin/posts", "Article created.");
}

export async function updatePostAction(formData: FormData) {
  await requireAdmin();
  const rawId = formData.get("id");
  const fallbackPath =
    typeof rawId === "string"
      ? `/admin/posts/${encodeURIComponent(rawId)}`
      : "/admin/posts";
  const parsed = postUpdateSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(fallbackPath, validationMessage(parsed.error.issues));
  const content = sanitizePostHtml(parsed.data.content);
  if (parsed.data.content && !content)
    errorRedirect(
      fallbackPath,
      "Article content must include supported text or media.",
    );
  const { id, author_id: ignoredAuthor, ...updates } = parsed.data;
  void ignoredAuthor;
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ ...updates, content })
    .eq("id", id);
  if (error)
    errorRedirect(
      fallbackPath,
      "The article could not be saved. Check that its slug is unique.",
    );
  revalidateContent("posts", updates.slug);
  successRedirect(`/admin/posts/${id}`, "Article saved.");
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success)
    errorRedirect("/admin/posts", "The article could not be identified.");
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("cover_image_path")
    .eq("id", parsed.data)
    .maybeSingle();
  const { error } = await supabase.from("posts").delete().eq("id", parsed.data);
  if (error) errorRedirect("/admin/posts", "The article could not be deleted.");
  await deleteMediaPathIfUnused(supabase, existing?.cover_image_path);
  revalidateContent("posts");
  successRedirect("/admin/posts", "Article deleted.");
}

export async function updateContactMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = contactMessageStatusUpdateSchema.safeParse(
    formRecord(formData),
  );
  if (!parsed.success)
    errorRedirect("/admin/messages", validationMessage(parsed.error.issues));
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error)
    errorRedirect(
      "/admin/messages",
      "The message status could not be updated.",
    );
  revalidatePath("/admin/messages");
  successRedirect("/admin/messages", "Message status updated.");
}

export async function deleteContactMessageAction(formData: FormData) {
  await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success)
    errorRedirect("/admin/messages", "The message could not be identified.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", parsed.data);
  if (error)
    errorRedirect("/admin/messages", "The message could not be deleted.");
  revalidatePath("/admin/messages");
  successRedirect("/admin/messages", "Message deleted.");
}

function siteSettingsRecord(formData: FormData, includeId: boolean) {
  const source = formRecord(formData);
  const socialLinks = Object.fromEntries(
    ["facebook", "instagram", "linkedin", "youtube", "tiktok", "x"].flatMap(
      (name) => {
        const value = source[`social_${name}`];
        return typeof value === "string" && value.trim() ? [[name, value]] : [];
      },
    ),
  );
  return {
    ...(includeId ? { id: source.id } : {}),
    company_name: source.company_name,
    short_name: source.short_name,
    tagline: source.tagline,
    description: source.description,
    location: source.location,
    address: source.address,
    email: source.email,
    phone: source.phone,
    logo_path: source.logo_path,
    hero_title: source.hero_title,
    hero_description: source.hero_description,
    hero_image_path: source.hero_image_path,
    about_image_path: source.about_image_path,
    about_title: source.about_title,
    about_content: source.about_content,
    social_links: JSON.stringify(socialLinks),
    default_seo_title: source.default_seo_title,
    default_seo_description: source.default_seo_description,
  };
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const source = siteSettingsRecord(
    formData,
    typeof id === "string" && id.length > 0,
  );
  const supabase = await createClient();

  if ("id" in source) {
    const parsed = siteSettingsUpdateSchema.safeParse(source);
    if (!parsed.success)
      errorRedirect("/admin/settings", validationMessage(parsed.error.issues));
    const { id: settingId, ...updates } = parsed.data;
    const { error } = await supabase
      .from("site_settings")
      .update(updates)
      .eq("id", settingId)
      .eq("settings_key", "default");
    if (error) errorRedirect("/admin/settings", "Settings could not be saved.");
  } else {
    const parsed = siteSettingsSchema.safeParse(source);
    if (!parsed.success)
      errorRedirect("/admin/settings", validationMessage(parsed.error.issues));
    const { error } = await supabase.from("site_settings").insert(parsed.data);
    if (error) errorRedirect("/admin/settings", "Settings could not be saved.");
  }
  revalidateSettings();
  successRedirect("/admin/settings", "Settings saved.");
}

export async function updateContactDetailsAction(formData: FormData) {
  await requireAdmin();
  const parsed = contactDetailsUpdateSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect("/admin/contact", validationMessage(parsed.error.issues));

  const { id, ...updates } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .update(updates)
    .eq("id", id)
    .eq("settings_key", "default")
    .select("id")
    .maybeSingle();

  if (error || !data)
    errorRedirect(
      "/admin/contact",
      "Contact details could not be saved. Please try again.",
    );

  revalidateSettings();
  successRedirect("/admin/contact", "Contact details saved.");
}

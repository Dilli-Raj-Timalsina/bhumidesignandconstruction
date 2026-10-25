"use server";

import sanitizeHtml from "sanitize-html";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/components/admin/require-admin";
import { publicContentTags } from "@/features/content/cache";
import { editorialContentSchema } from "@/features/content/editorial";
import { pageIntroKeys } from "@/features/content/page-intros";
import {
  getConfiguredAdminCredentials,
  hasAdminServerConfiguration,
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
  imageExtensions,
  imageFileError,
  maximumImageUploadBytes,
} from "@/lib/media/image-validation";
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
} from "@/lib/validations";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

const mediaBucket = "media";
type UploadFolder =
  "gallery" | "posts" | "projects" | "services" | "site" | "uploads";
const adminPathPattern = /^\/admin(?:\/[A-Za-z0-9._~-]+)*$/;
const managedMediaPathPattern =
  /^(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9][A-Za-z0-9._/-]*$/;

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
  reason:
    "configuration" | "credentials" | "rate_limited" | "setup" | "unavailable",
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
  const notice = noticePath(path, "notice", message);
  redirect(`${notice}&noticeId=${crypto.randomUUID()}`);
}

function formRecord(formData: FormData) {
  const record = Object.fromEntries(
    [...formData.entries()].filter((entry) => !(entry[1] instanceof File)),
  );
  for (const [name, value] of formData.entries()) {
    if (!(value instanceof File) || value.size === 0 || !name.endsWith("_file"))
      continue;
    // File contents are uploaded only after the rest of the form validates.
    // This valid placeholder is always replaced with the generated object key.
    record[name.slice(0, -"_file".length)] = "uploads/pending";
  }
  return record;
}

function revalidateContent(
  kind: "projects" | "services" | "gallery" | "posts",
  slug?: string,
) {
  updateTag(publicContentTags[kind]);
  revalidatePath("/");
  if (kind === "projects") {
    revalidatePath("/projects");
    revalidatePath("/projects/[slug]", "page");
    revalidatePath("/sitemap.xml");
    if (slug) revalidatePath(`/projects/${slug}`);
  }
  if (kind === "services") revalidatePath("/services");
  if (kind === "gallery") revalidatePath("/gallery");
  if (kind === "posts") {
    revalidatePath("/insights");
    revalidatePath("/insights/[slug]", "page");
    revalidatePath("/sitemap.xml");
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
  updateTag(publicContentTags.site);
  revalidatePath("/", "layout");
}

function isManagedMediaPath(path: string | null | undefined): path is string {
  return Boolean(path && managedMediaPathPattern.test(path));
}

async function queueMediaCleanup(
  client: SupabaseClient<Database>,
  path: string,
  message?: string,
) {
  if (!isManagedMediaPath(path)) return;
  await client.from("media_cleanup_queue").upsert({
    path,
    eligible_after: new Date().toISOString(),
    last_error: message?.slice(0, 500) ?? null,
  });
}

async function clearQueuedMediaCleanup(
  client: SupabaseClient<Database>,
  path: string,
) {
  if (!isManagedMediaPath(path)) return;
  await client.from("media_cleanup_queue").delete().eq("path", path);
}

async function deleteMediaPathIfUnused(
  client: SupabaseClient<Database>,
  path: string | null | undefined,
) {
  if (!isManagedMediaPath(path)) return;
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
      .from("post_media")
      .select("post_id", { count: "exact", head: true })
      .eq("image_path", path),
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
    client
      .from("site_settings")
      .select("id", { count: "exact", head: true })
      .eq("highlights_image_path", path),
  ]);

  const requiredChecks = checks.slice(0, -1);
  const highlightsCheck = checks[checks.length - 1];
  const highlightsColumnMissing =
    highlightsCheck.error &&
    ["42703", "PGRST204"].includes(highlightsCheck.error.code);
  if (
    requiredChecks.some((result) => result.error) ||
    (highlightsCheck.error && !highlightsColumnMissing)
  ) {
    await queueMediaCleanup(client, path, "Could not verify media references.");
    return;
  }
  if (checks.some((result) => (result.count ?? 0) > 0)) {
    await clearQueuedMediaCleanup(client, path);
    return;
  }

  const { error } = await client.storage.from(mediaBucket).remove([path]);
  if (error) {
    await queueMediaCleanup(client, path, error.message);
    return;
  }
  await clearQueuedMediaCleanup(client, path);
}

async function processQueuedMediaCleanups(
  client: SupabaseClient<Database>,
  limit = 20,
) {
  const { data, error } = await client
    .from("media_cleanup_queue")
    .select("path")
    .lte("eligible_after", new Date().toISOString())
    .order("eligible_after", { ascending: true })
    .limit(limit);
  if (error) return;
  await Promise.all(
    (data ?? []).map((entry) => deleteMediaPathIfUnused(client, entry.path)),
  );
}

async function uploadImageFile(
  client: SupabaseClient<Database>,
  file: File,
  folder: UploadFolder,
): Promise<string> {
  const validationError = await imageFileError(file);
  if (validationError) throw new Error(validationError);

  const extension = imageExtensions.get(file.type);
  if (!extension) throw new Error("Unsupported image file type.");
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage
    .from(mediaBucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error)
    throw new Error("The image could not be uploaded. Please try again.");
  return path;
}

async function uploadImageFromForm(
  client: SupabaseClient<Database>,
  formData: FormData,
  field: string,
  folder: UploadFolder,
) {
  const file = formData.get(`${field}_file`);
  if (!(file instanceof File) || file.size === 0) return null;
  await processQueuedMediaCleanups(client);
  return uploadImageFile(client, file, folder);
}

async function uploadImageFields(
  client: SupabaseClient<Database>,
  formData: FormData,
  fields: readonly { field: string; folder: UploadFolder }[],
) {
  const uploaded: Record<string, string> = {};
  try {
    for (const { field, folder } of fields) {
      const path = await uploadImageFromForm(client, formData, field, folder);
      if (path) uploaded[field] = path;
    }
    return uploaded;
  } catch (error) {
    await Promise.all(
      Object.values(uploaded).map((path) =>
        removeNewUploadAfterFailedWrite(client, path),
      ),
    );
    throw error;
  }
}

function uploadErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The image could not be uploaded. Please try again.";
}

type ProjectUploadKind =
  "project-create" | "project-update" | "image-create" | "image-update";

const preparedProjectPathPattern =
  /^projects\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$/i;

/** Authorize a direct Storage upload after validating the text fields. */
export async function prepareProjectImageUploadAction(
  kind: ProjectUploadKind,
  formData: FormData,
  contentType: string,
  size: number,
): Promise<{ path: string; token: string } | { error: string }> {
  await requireAdmin();
  const extension = imageExtensions.get(contentType);
  if (!extension) return { error: "Choose a JPEG, PNG, WebP, or AVIF image." };
  if (!Number.isInteger(size) || size <= 0 || size > maximumImageUploadBytes) {
    return { error: "Image files must be between 1 byte and 8 MB." };
  }

  const record = formRecord(formData);
  if (kind === "image-create") record.image_path = "uploads/pending";
  const schema =
    kind === "project-create"
      ? projectSchema
      : kind === "project-update"
        ? projectUpdateSchema
        : kind === "image-create"
          ? projectImageSchema
          : projectImageUpdateSchema;
  const parsed = schema.safeParse(record);
  if (!parsed.success) return { error: validationMessage(parsed.error.issues) };

  const supabase = await createClient();
  if (kind !== "project-create") {
    const id = kind === "project-update" ? record.id : record.project_id;
    const { data, error } = await supabase
      .from("projects")
      .select("id")
      .eq("id", String(id))
      .maybeSingle();
    if (error || !data) return { error: "The project could not be found." };
  }
  if (kind === "image-update") {
    const { data, error } = await supabase
      .from("project_images")
      .select("id")
      .eq("id", String(record.id))
      .eq("project_id", String(record.project_id))
      .maybeSingle();
    if (error || !data) return { error: "The image could not be found." };
  }

  await processQueuedMediaCleanups(supabase);
  const path = `projects/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage
    .from(mediaBucket)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return {
      error: "The image upload could not be prepared. Please try again.",
    };
  }
  const { error: queueError } = await supabase
    .from("media_cleanup_queue")
    .upsert({
      path,
      eligible_after: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      last_error: null,
    });
  if (queueError) {
    return {
      error: "The image upload could not be prepared. Please try again.",
    };
  }
  return { path, token: data.token };
}

async function verifyPreparedProjectImage(
  client: SupabaseClient<Database>,
  path: string,
): Promise<boolean> {
  if (!preparedProjectPathPattern.test(path)) return false;
  const { data: queued, error: queueError } = await client
    .from("media_cleanup_queue")
    .select("path")
    .eq("path", path)
    .maybeSingle();
  if (queueError || !queued) return false;
  const { data, error } = await client.storage.from(mediaBucket).info(path);
  if (error || !data) return false;
  const extension = imageExtensions.get(data.contentType ?? "");
  if (
    !extension ||
    !path.endsWith(`.${extension}`) ||
    typeof data.size !== "number" ||
    data.size <= 0 ||
    data.size > maximumImageUploadBytes
  ) {
    return false;
  }
  const { data: image, error: downloadError } = await client.storage
    .from(mediaBucket)
    .download(path);
  return (
    !downloadError && Boolean(image) && (await imageFileError(image)) === null
  );
}

async function removeNewUploadAfterFailedWrite(
  client: SupabaseClient<Database>,
  path: string | null,
) {
  if (path) await deleteMediaPathIfUnused(client, path);
}

async function cleanupReplacedMedia(
  client: SupabaseClient<Database>,
  previousPath: string | null | undefined,
  currentPath: string | null | undefined,
) {
  if (previousPath && previousPath !== currentPath) {
    await deleteMediaPathIfUnused(client, previousPath);
  }
}

async function deleteProjectMedia(
  client: SupabaseClient<Database>,
  id: string,
) {
  const [projectResult, imageResult] = await Promise.all([
    client
      .from("projects")
      .select("cover_image_path")
      .eq("id", id)
      .maybeSingle(),
    client.from("project_images").select("image_path").eq("project_id", id),
  ]);
  if (projectResult.error || !projectResult.data || imageResult.error) {
    return new Error("The project could not be read before deletion.");
  }
  const project = projectResult.data;
  const images = imageResult.data;
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
  const [albumResult, imageResult] = await Promise.all([
    client
      .from("gallery_albums")
      .select("cover_image_path")
      .eq("id", id)
      .maybeSingle(),
    client.from("gallery_images").select("image_path").eq("album_id", id),
  ]);
  if (albumResult.error || !albumResult.data || imageResult.error) {
    return new Error("The album could not be read before deletion.");
  }
  const album = albumResult.data;
  const images = imageResult.data;
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
  if (!hasSupabaseEnv() || !hasAdminServerConfiguration()) {
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
  let setupRequired = false;
  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: configured.email,
      password: configured.password,
    });
    if (error || !data.user) {
      setupRequired = true;
    } else {
      const { data: isAdmin, error: roleError } =
        await supabase.rpc("is_admin");
      setupRequired =
        Boolean(roleError) ||
        isAdmin !== true ||
        !data.user.email_confirmed_at ||
        !isConfiguredAdminEmail(data.user.email);
    }
  } catch {
    if (supabase) await supabase.auth.signOut();
    loginRedirect("unavailable", next);
  }

  if (setupRequired) {
    await supabase.auth.signOut();
    loginRedirect("setup", next);
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

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  const parsed = projectSchema.safeParse(formRecord(formData));
  if (!parsed.success)
    errorRedirect(
      "/admin/projects/new",
      validationMessage(parsed.error.issues),
    );
  const supabase = await createClient();
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "cover_image_path",
      "projects",
    );
  } catch (error) {
    errorRedirect("/admin/projects/new", uploadErrorMessage(error));
  }
  const preparedPath = !uploadedPath ? parsed.data.cover_image_path : null;
  if (
    preparedPath &&
    !(await verifyPreparedProjectImage(supabase, preparedPath))
  ) {
    errorRedirect(
      "/admin/projects/new",
      "The cover image upload did not finish. Please try again.",
    );
  }
  const project = {
    ...parsed.data,
    ...(uploadedPath ? { cover_image_path: uploadedPath } : {}),
  };
  const { error } = await supabase.from("projects").insert(project);
  if (error)
    await removeNewUploadAfterFailedWrite(
      supabase,
      uploadedPath ?? preparedPath,
    );
  if (error)
    errorRedirect(
      "/admin/projects/new",
      "The project could not be created. Check that its slug is unique.",
    );
  if (preparedPath) await clearQueuedMediaCleanup(supabase, preparedPath);
  revalidateContent("projects", project.slug);
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
  const { data: existing, error: existingError } = await supabase
    .from("projects")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing)
    errorRedirect(fallbackPath, "The project could not be found.");

  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "cover_image_path",
      "projects",
    );
  } catch (error) {
    errorRedirect(fallbackPath, uploadErrorMessage(error));
  }
  const nextPath = uploadedPath ?? updates.cover_image_path;
  const preparedPath =
    !uploadedPath && nextPath && nextPath !== existing.cover_image_path
      ? nextPath
      : null;
  if (
    preparedPath &&
    !(await verifyPreparedProjectImage(supabase, preparedPath))
  ) {
    errorRedirect(
      fallbackPath,
      "The cover image upload did not finish. Please try again.",
    );
  }
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, cover_image_path: nextPath })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    await removeNewUploadAfterFailedWrite(
      supabase,
      uploadedPath ?? preparedPath,
    );
  if (error || !data)
    errorRedirect(
      fallbackPath,
      "The project could not be saved. Check that its slug is unique.",
    );
  if (preparedPath) await clearQueuedMediaCleanup(supabase, preparedPath);
  await cleanupReplacedMedia(supabase, existing.cover_image_path, nextPath);
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
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", parsed.data.project_id)
    .maybeSingle();
  if (projectError || !project)
    errorRedirect(fallbackPath, "The project could not be found.");
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "image_path",
      "projects",
    );
  } catch (error) {
    errorRedirect(fallbackPath, uploadErrorMessage(error));
  }
  const preparedPath = !uploadedPath ? parsed.data.image_path : null;
  if (
    preparedPath &&
    !(await verifyPreparedProjectImage(supabase, preparedPath))
  ) {
    errorRedirect(
      fallbackPath,
      "The image upload did not finish. Please try again.",
    );
  }
  const image = {
    ...parsed.data,
    ...(uploadedPath ? { image_path: uploadedPath } : {}),
  };
  const { error } = await supabase.from("project_images").insert(image);
  if (error)
    await removeNewUploadAfterFailedWrite(
      supabase,
      uploadedPath ?? preparedPath,
    );
  if (error) errorRedirect(fallbackPath, "The image could not be added.");
  if (preparedPath) await clearQueuedMediaCleanup(supabase, preparedPath);
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
  const { data: existing, error: existingError } = await supabase
    .from("project_images")
    .select("image_path")
    .eq("id", id)
    .eq("project_id", parsed.data.project_id)
    .maybeSingle();
  if (existingError || !existing)
    errorRedirect(fallbackPath, "The image could not be found.");
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "image_path",
      "projects",
    );
  } catch (error) {
    errorRedirect(fallbackPath, uploadErrorMessage(error));
  }
  const nextPath = uploadedPath ?? updates.image_path;
  const preparedPath =
    !uploadedPath && nextPath !== existing.image_path ? nextPath : null;
  if (
    preparedPath &&
    !(await verifyPreparedProjectImage(supabase, preparedPath))
  ) {
    errorRedirect(
      fallbackPath,
      "The image upload did not finish. Please try again.",
    );
  }
  const { data, error } = await supabase
    .from("project_images")
    .update({ ...updates, image_path: nextPath })
    .eq("id", id)
    .eq("project_id", parsed.data.project_id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    await removeNewUploadAfterFailedWrite(
      supabase,
      uploadedPath ?? preparedPath,
    );
  if (error || !data)
    errorRedirect(fallbackPath, "The image could not be saved.");
  if (preparedPath) await clearQueuedMediaCleanup(supabase, preparedPath);
  await cleanupReplacedMedia(supabase, existing.image_path, nextPath);
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
    .eq("project_id", projectId.data)
    .maybeSingle();
  if (!existing)
    errorRedirect(
      `/admin/projects/${projectId.data}`,
      "The image could not be found.",
    );
  const { error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", id.data)
    .eq("project_id", projectId.data);
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
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "cover_image_path",
      "services",
    );
  } catch (error) {
    errorRedirect("/admin/services/new", uploadErrorMessage(error));
  }
  const service = {
    ...parsed.data,
    ...(uploadedPath ? { cover_image_path: uploadedPath } : {}),
  };
  const { error } = await supabase.from("services").insert(service);
  if (error) await removeNewUploadAfterFailedWrite(supabase, uploadedPath);
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
  const { data: existing, error: existingError } = await supabase
    .from("services")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing)
    errorRedirect(fallbackPath, "The service could not be found.");
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "cover_image_path",
      "services",
    );
  } catch (error) {
    errorRedirect(fallbackPath, uploadErrorMessage(error));
  }
  const nextPath = uploadedPath ?? updates.cover_image_path;
  const { data, error } = await supabase
    .from("services")
    .update({ ...updates, cover_image_path: nextPath })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    await removeNewUploadAfterFailedWrite(supabase, uploadedPath);
  if (error || !data)
    errorRedirect(
      fallbackPath,
      "The service could not be saved. Check that its slug is unique.",
    );
  await cleanupReplacedMedia(supabase, existing.cover_image_path, nextPath);
  revalidateContent("services");
  successRedirect(`/admin/services/${id}`, "Service saved.");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success)
    errorRedirect("/admin/services", "The service could not be identified.");
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("services")
    .select("cover_image_path")
    .eq("id", parsed.data)
    .maybeSingle();
  if (existingError || !existing)
    errorRedirect("/admin/services", "The service could not be found.");
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
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "cover_image_path",
      "gallery",
    );
  } catch (error) {
    errorRedirect("/admin/gallery/new", uploadErrorMessage(error));
  }
  const album = {
    ...parsed.data,
    ...(uploadedPath ? { cover_image_path: uploadedPath } : {}),
  };
  const { error } = await supabase.from("gallery_albums").insert(album);
  if (error) await removeNewUploadAfterFailedWrite(supabase, uploadedPath);
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
  const { data: existing, error: existingError } = await supabase
    .from("gallery_albums")
    .select("cover_image_path")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing)
    errorRedirect(fallbackPath, "The album could not be found.");
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "cover_image_path",
      "gallery",
    );
  } catch (error) {
    errorRedirect(fallbackPath, uploadErrorMessage(error));
  }
  const nextPath = uploadedPath ?? updates.cover_image_path;
  const { data, error } = await supabase
    .from("gallery_albums")
    .update({ ...updates, cover_image_path: nextPath })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    await removeNewUploadAfterFailedWrite(supabase, uploadedPath);
  if (error || !data)
    errorRedirect(
      fallbackPath,
      "The album could not be saved. Check that its slug is unique.",
    );
  await cleanupReplacedMedia(supabase, existing.cover_image_path, nextPath);
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
  const { data: album, error: albumError } = await supabase
    .from("gallery_albums")
    .select("id")
    .eq("id", parsed.data.album_id)
    .maybeSingle();
  if (albumError || !album)
    errorRedirect(fallbackPath, "The album could not be found.");
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "image_path",
      "gallery",
    );
  } catch (error) {
    errorRedirect(fallbackPath, uploadErrorMessage(error));
  }
  const image = {
    ...parsed.data,
    ...(uploadedPath ? { image_path: uploadedPath } : {}),
  };
  const { error } = await supabase.from("gallery_images").insert(image);
  if (error) await removeNewUploadAfterFailedWrite(supabase, uploadedPath);
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
  const { data: existing, error: existingError } = await supabase
    .from("gallery_images")
    .select("image_path")
    .eq("id", id)
    .eq("album_id", parsed.data.album_id)
    .maybeSingle();
  if (existingError || !existing)
    errorRedirect(fallbackPath, "The image could not be found.");
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "image_path",
      "gallery",
    );
  } catch (error) {
    errorRedirect(fallbackPath, uploadErrorMessage(error));
  }
  const nextPath = uploadedPath ?? updates.image_path;
  const { data, error } = await supabase
    .from("gallery_images")
    .update({ ...updates, image_path: nextPath })
    .eq("id", id)
    .eq("album_id", parsed.data.album_id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    await removeNewUploadAfterFailedWrite(supabase, uploadedPath);
  if (error || !data)
    errorRedirect(fallbackPath, "The image could not be saved.");
  await cleanupReplacedMedia(supabase, existing.image_path, nextPath);
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
    .eq("album_id", albumId.data)
    .maybeSingle();
  if (!existing)
    errorRedirect(
      `/admin/gallery/${albumId.data}`,
      "The image could not be found.",
    );
  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", id.data)
    .eq("album_id", albumId.data);
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
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "cover_image_path",
      "posts",
    );
  } catch (error) {
    errorRedirect("/admin/posts/new", uploadErrorMessage(error));
  }
  const post = {
    ...parsed.data,
    content,
    author_id: admin.id,
    ...(uploadedPath ? { cover_image_path: uploadedPath } : {}),
  };
  const { error } = await supabase.from("posts").insert(post);
  if (error) await removeNewUploadAfterFailedWrite(supabase, uploadedPath);
  if (error)
    errorRedirect(
      "/admin/posts/new",
      "The article could not be created. Check that its slug is unique.",
    );
  revalidateContent("posts", post.slug);
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
  const [postResult, mediaResult] = await Promise.all([
    supabase
      .from("posts")
      .select("cover_image_path")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("post_media").select("image_path").eq("post_id", id),
  ]);
  if (postResult.error || !postResult.data || mediaResult.error)
    errorRedirect(fallbackPath, "The article could not be found.");
  let uploadedPath: string | null = null;
  try {
    uploadedPath = await uploadImageFromForm(
      supabase,
      formData,
      "cover_image_path",
      "posts",
    );
  } catch (error) {
    errorRedirect(fallbackPath, uploadErrorMessage(error));
  }
  const nextPath = uploadedPath ?? updates.cover_image_path;
  const { data, error } = await supabase
    .from("posts")
    .update({ ...updates, content, cover_image_path: nextPath })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data)
    await removeNewUploadAfterFailedWrite(supabase, uploadedPath);
  if (error || !data)
    errorRedirect(
      fallbackPath,
      "The article could not be saved. Check that its slug is unique.",
    );
  await Promise.all([
    cleanupReplacedMedia(supabase, postResult.data.cover_image_path, nextPath),
    ...(mediaResult.data ?? []).map((media) =>
      deleteMediaPathIfUnused(supabase, media.image_path),
    ),
  ]);
  revalidateContent("posts", updates.slug);
  successRedirect(`/admin/posts/${id}`, "Article saved.");
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const parsed = idSchema.safeParse(formData.get("id"));
  if (!parsed.success)
    errorRedirect("/admin/posts", "The article could not be identified.");
  const supabase = await createClient();
  const [postResult, mediaResult] = await Promise.all([
    supabase
      .from("posts")
      .select("cover_image_path")
      .eq("id", parsed.data)
      .maybeSingle(),
    supabase.from("post_media").select("image_path").eq("post_id", parsed.data),
  ]);
  if (postResult.error || !postResult.data || mediaResult.error)
    errorRedirect("/admin/posts", "The article could not be found.");
  const { error } = await supabase.from("posts").delete().eq("id", parsed.data);
  if (error) errorRedirect("/admin/posts", "The article could not be deleted.");
  await Promise.all([
    deleteMediaPathIfUnused(supabase, postResult.data.cover_image_path),
    ...(mediaResult.data ?? []).map((media) =>
      deleteMediaPathIfUnused(supabase, media.image_path),
    ),
  ]);
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
    hero_image_alt: source.hero_image_alt,
    about_image_path: source.about_image_path,
    about_image_alt: source.about_image_alt,
    highlights_image_path: source.highlights_image_path,
    about_title: source.about_title,
    about_content: source.about_content,
    page_intros: JSON.stringify(
      Object.fromEntries(
        pageIntroKeys.map((key) => [
          key,
          {
            eyebrow: source[`page_intro_${key}_eyebrow`],
            title: source[`page_intro_${key}_title`],
            subtitle: source[`page_intro_${key}_subtitle`],
          },
        ]),
      ),
    ),
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
  const siteImageFields = [
    { field: "logo_path", folder: "site" },
    { field: "hero_image_path", folder: "site" },
    { field: "about_image_path", folder: "site" },
    { field: "highlights_image_path", folder: "site" },
  ] as const;

  if ("id" in source) {
    const parsed = siteSettingsUpdateSchema.safeParse(source);
    if (!parsed.success)
      errorRedirect("/admin/settings", validationMessage(parsed.error.issues));
    const { id: settingId, ...updates } = parsed.data;
    const { data: existing, error: existingError } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", settingId)
      .eq("settings_key", "default")
      .maybeSingle();
    if (existingError || !existing)
      errorRedirect("/admin/settings", "Settings could not be found.");

    let uploads: Record<string, string> = {};
    try {
      uploads = await uploadImageFields(supabase, formData, siteImageFields);
    } catch (error) {
      errorRedirect("/admin/settings", uploadErrorMessage(error));
    }
    const nextSettings = { ...updates, ...uploads };
    const {
      page_intros: _pageIntros,
      hero_image_alt: _heroAlt,
      about_image_alt: _aboutAlt,
      highlights_image_path: _highlightsImage,
      ...settingsWithoutIntros
    } = nextSettings;
    const settingsToSave =
      "editorial_content" in existing
        ? nextSettings
        : "page_intros" in existing
          ? { ...settingsWithoutIntros, page_intros: nextSettings.page_intros }
          : settingsWithoutIntros;
    const { data, error } = await supabase
      .from("site_settings")
      .update(settingsToSave)
      .eq("id", settingId)
      .eq("settings_key", "default")
      .select("id")
      .maybeSingle();
    if (error || !data)
      await Promise.all(
        Object.values(uploads).map((path) =>
          removeNewUploadAfterFailedWrite(supabase, path),
        ),
      );
    if (error || !data)
      errorRedirect("/admin/settings", "Settings could not be saved.");
    await Promise.all(
      siteImageFields.map(({ field }) =>
        cleanupReplacedMedia(supabase, existing[field], nextSettings[field]),
      ),
    );
  } else {
    const parsed = siteSettingsSchema.safeParse(source);
    if (!parsed.success)
      errorRedirect("/admin/settings", validationMessage(parsed.error.issues));
    let uploads: Record<string, string> = {};
    try {
      uploads = await uploadImageFields(supabase, formData, siteImageFields);
    } catch (error) {
      errorRedirect("/admin/settings", uploadErrorMessage(error));
    }
    const newSettings = { ...parsed.data, ...uploads };
    let { error } = await supabase.from("site_settings").insert(newSettings);
    if (error && ["PGRST204", "42703"].includes(error.code)) {
      const {
        hero_image_alt: _heroAlt,
        about_image_alt: _aboutAlt,
        highlights_image_path: _highlightsImage,
        ...settingsWithoutEditorialColumns
      } = newSettings;
      ({ error } = await supabase
        .from("site_settings")
        .insert(settingsWithoutEditorialColumns));
      if (error && ["PGRST204", "42703"].includes(error.code)) {
        const { page_intros: _pageIntros, ...legacySettings } =
          settingsWithoutEditorialColumns;
        ({ error } = await supabase
          .from("site_settings")
          .insert(legacySettings));
      }
    }
    if (error)
      await Promise.all(
        Object.values(uploads).map((path) =>
          removeNewUploadAfterFailedWrite(supabase, path),
        ),
      );
    if (error) errorRedirect("/admin/settings", "Settings could not be saved.");
  }
  revalidateSettings();
  successRedirect("/admin/settings", "Settings saved.");
}

export async function updateEditorialContentAction(formData: FormData) {
  await requireAdmin();
  let submitted: unknown;
  try {
    submitted = JSON.parse(String(formData.get("editorial_content") ?? ""));
  } catch {
    errorRedirect("/admin/page-content", "Page content could not be read.");
  }
  const parsed = editorialContentSchema.safeParse(submitted);
  if (!parsed.success)
    errorRedirect(
      "/admin/page-content",
      validationMessage(parsed.error.issues),
    );

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .update({ editorial_content: parsed.data })
    .eq("settings_key", "default")
    .select("id")
    .maybeSingle();
  if (error || !data)
    errorRedirect(
      "/admin/page-content",
      "Page content could not be saved. Apply the editorial content migration first.",
    );
  revalidateSettings();
  successRedirect("/admin/page-content", "Page content saved.");
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

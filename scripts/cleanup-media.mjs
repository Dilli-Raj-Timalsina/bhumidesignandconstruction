import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

// Retries Storage removals that were queued after a completed database change.
// Run this from a trusted scheduler, or manually with `npm run media:cleanup`.
nextEnv.loadEnvConfig(process.cwd());

const bucket = "media";
const batchSize = 100;

function requiredEnvironmentValue(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function isReferenced(client, path) {
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
  ]);
  if (checks.some((result) => result.error)) return null;
  return checks.some((result) => (result.count ?? 0) > 0);
}

async function cleanupMedia() {
  const url = requiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnvironmentValue("SUPABASE_SERVICE_ROLE_KEY");
  const client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: candidates, error } = await client
    .from("media_cleanup_queue")
    .select("path")
    .lte("eligible_after", new Date().toISOString())
    .order("eligible_after", { ascending: true })
    .limit(batchSize);
  if (error)
    throw new Error(`Could not read the cleanup queue: ${error.message}`);

  let deleted = 0;
  let preserved = 0;
  let deferred = 0;
  for (const candidate of candidates ?? []) {
    const referenced = await isReferenced(client, candidate.path);
    if (referenced === null) {
      await client
        .from("media_cleanup_queue")
        .update({
          eligible_after: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          last_error: "Could not verify media references.",
        })
        .eq("path", candidate.path);
      deferred += 1;
      continue;
    }
    if (referenced) {
      await client
        .from("media_cleanup_queue")
        .delete()
        .eq("path", candidate.path);
      preserved += 1;
      continue;
    }

    const { error: removeError } = await client.storage
      .from(bucket)
      .remove([candidate.path]);
    if (removeError) {
      await client
        .from("media_cleanup_queue")
        .update({
          eligible_after: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          last_error: removeError.message.slice(0, 500),
        })
        .eq("path", candidate.path);
      deferred += 1;
      continue;
    }
    await client
      .from("media_cleanup_queue")
      .delete()
      .eq("path", candidate.path);
    deleted += 1;
  }

  console.info(
    JSON.stringify(
      {
        processed: candidates?.length ?? 0,
        deleted,
        preserved,
        deferred,
      },
      null,
      2,
    ),
  );
}

cleanupMedia().catch((error) => {
  console.error(
    error instanceof Error
      ? `Media cleanup failed: ${error.message}`
      : "Media cleanup failed.",
  );
  process.exitCode = 1;
});

import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

// This is an idempotent maintenance script. It copies the launch assets into
// Supabase Storage and replaces only the matching legacy `/images/...` paths
// in CMS rows. It can safely be re-run after an interrupted migration.
nextEnv.loadEnvConfig(process.cwd());

const bucket = "media";
const projectRoot = process.cwd();
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const contentTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

function requiredEnvironmentValue(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function contentTypeFor(filename) {
  const extension = path.extname(filename).toLowerCase();
  const contentType = contentTypes[extension];
  if (!contentType || !imageExtensions.has(extension)) {
    throw new Error(`Unsupported image file: ${filename}`);
  }
  return contentType;
}

function seededAsset(oldPath, objectPath) {
  return {
    oldPath,
    objectPath,
    localPath: path.join(projectRoot, "public", oldPath),
    contentType: contentTypeFor(oldPath),
  };
}

const assets = [
  seededAsset("/brand/bhumi-wordmark.png", "site/bhumi-wordmark.png"),
  seededAsset("/brand/bhumi-icon.png", "site/bhumi-icon.png"),
  seededAsset(
    "/images/marketing/rebar-background.jpg",
    "marketing/rebar-background.jpg",
  ),
];

for (const filename of [
  "gehendra-oli-contract-signing-2.jpg",
  "gehendra-oli-contract-signing.jpg",
  "gehendra-oli-foundation-progress-2.jpg",
  "gehendra-oli-foundation-progress.jpg",
  "gehendra-oli-proposed-design.jpg",
  "gehendra-oli-rcc-columns.jpg",
  "gehendra-oli-toe-wall-reinforcement.jpg",
  "hari-pariyar-brick-facade.jpg",
  "hari-pariyar-complete.jpg",
  "hari-pariyar-plastering.jpg",
  "hari-pariyar-roof-complete.jpg",
  "hari-pariyar-roof-shuttering.jpg",
  "hari-pariyar-side-view.jpg",
  "krishna-oli-contract-signing.jpg",
  "krishna-oli-proposed-design.jpg",
  "krishna-oli-roof-slab-shuttering.jpg",
  "murkuti-crb-formwork-removed.png",
  "murkuti-crb-shuttering-site.png",
  "murkuti-crb-shuttering.png",
  "murkuti-crb-slab-casting-site.png",
  "murkuti-crb-slab-casting.png",
  "murkuti-staff-quarter-shuttering.png",
  "murkuti-staff-quarter-slab-casting.png",
  "sher-khadka-brickwork.jpg",
  "sher-khadka-contract-signing.jpg",
  "sher-khadka-finishing.jpg",
  "sher-khadka-foundation-footings.jpg",
  "sher-khadka-foundation-toe-wall.jpg",
  "sher-khadka-proposed-design.jpg",
  "sher-khadka-slab-reinforcement.jpg",
  "sher-khadka-superstructure-shuttering.jpg",
  "sher-khadka-toe-wall-reinforcement.jpg",
]) {
  assets.push(
    seededAsset(`/images/portfolio/${filename}`, `portfolio/${filename}`),
  );
}

const replacementPaths = new Map(
  assets.map(({ oldPath, objectPath }) => [oldPath, objectPath]),
);

function replacePath(value) {
  return typeof value === "string"
    ? (replacementPaths.get(value) ?? value)
    : value;
}

async function uploadAssets(supabase) {
  for (const asset of assets) {
    const details = await stat(asset.localPath);
    if (details.size === 0) throw new Error(`${asset.oldPath} is empty.`);
    if (details.size > 10 * 1024 * 1024) {
      throw new Error(
        `${asset.oldPath} is larger than the media bucket limit.`,
      );
    }

    const file = await readFile(asset.localPath);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(asset.objectPath, file, {
        contentType: asset.contentType,
        cacheControl: "31536000",
        upsert: true,
      });
    if (error)
      throw new Error(`Could not upload ${asset.oldPath}: ${error.message}`);
  }
}

async function updatePathColumn(supabase, table, column) {
  const { data: rows, error: selectError } = await supabase
    .from(table)
    .select(`id, ${column}`);
  if (selectError)
    throw new Error(`Could not read ${table}: ${selectError.message}`);

  let updated = 0;
  for (const row of rows ?? []) {
    const nextPath = replacePath(row[column]);
    if (nextPath === row[column]) continue;

    const { error: updateError } = await supabase
      .from(table)
      .update({ [column]: nextPath })
      .eq("id", row.id);
    if (updateError) {
      throw new Error(`Could not update ${table}: ${updateError.message}`);
    }
    updated += 1;
  }
  return updated;
}

async function countLegacyPaths(supabase, table, column) {
  const { data: rows, error } = await supabase.from(table).select(column);
  if (error) throw new Error(`Could not verify ${table}: ${error.message}`);
  return (rows ?? []).filter((row) => replacementPaths.has(row[column])).length;
}

async function migrateSeededMedia() {
  const url = requiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnvironmentValue("SUPABASE_SERVICE_ROLE_KEY");
  try {
    new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await uploadAssets(supabase);

  const updates = {
    siteSettings: await updatePathColumn(
      supabase,
      "site_settings",
      "logo_path",
    ),
    siteHero: await updatePathColumn(
      supabase,
      "site_settings",
      "hero_image_path",
    ),
    siteAbout: await updatePathColumn(
      supabase,
      "site_settings",
      "about_image_path",
    ),
    projects: await updatePathColumn(supabase, "projects", "cover_image_path"),
    projectImages: await updatePathColumn(
      supabase,
      "project_images",
      "image_path",
    ),
    services: await updatePathColumn(supabase, "services", "cover_image_path"),
    galleryAlbums: await updatePathColumn(
      supabase,
      "gallery_albums",
      "cover_image_path",
    ),
    galleryImages: await updatePathColumn(
      supabase,
      "gallery_images",
      "image_path",
    ),
    posts: await updatePathColumn(supabase, "posts", "cover_image_path"),
  };

  const checks = [
    ["site_settings", "logo_path"],
    ["site_settings", "hero_image_path"],
    ["site_settings", "about_image_path"],
    ["projects", "cover_image_path"],
    ["project_images", "image_path"],
    ["services", "cover_image_path"],
    ["gallery_albums", "cover_image_path"],
    ["gallery_images", "image_path"],
    ["posts", "cover_image_path"],
  ];
  const remainingLegacyPaths = (
    await Promise.all(
      checks.map(([table, column]) =>
        countLegacyPaths(supabase, table, column),
      ),
    )
  ).reduce((total, count) => total + count, 0);
  if (remainingLegacyPaths > 0) {
    throw new Error(`${remainingLegacyPaths} legacy CMS image paths remain.`);
  }

  const publicUrl = supabase.storage
    .from(bucket)
    .getPublicUrl("site/bhumi-wordmark.png").data.publicUrl;
  const response = await fetch(publicUrl, { method: "HEAD" });
  if (!response.ok) {
    throw new Error("Uploaded media could not be read from the public bucket.");
  }

  console.info(
    JSON.stringify(
      {
        uploadedAssets: assets.length,
        updatedRows: Object.values(updates).reduce(
          (total, count) => total + count,
          0,
        ),
        updates,
        remainingLegacyPaths,
      },
      null,
      2,
    ),
  );
}

migrateSeededMedia().catch((error) => {
  console.error(
    error instanceof Error
      ? `Seeded media migration failed: ${error.message}`
      : "Seeded media migration failed.",
  );
  process.exitCode = 1;
});

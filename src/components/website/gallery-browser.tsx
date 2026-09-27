"use client";

import { useMemo, useState } from "react";

import type { PublicGalleryAlbum } from "@/features/content/types";
import { cn } from "@/lib/utils";

import { GalleryGrid } from "./gallery-grid";

export function GalleryBrowser({ albums }: { albums: PublicGalleryAlbum[] }) {
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          albums
            .map((album) => album.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ),
    [albums],
  );
  const [active, setActive] = useState("All");
  const visible =
    active === "All"
      ? albums
      : albums.filter((album) => album.category === active);
  const images = visible
    .flatMap((album) =>
      album.images.map((image) => ({ ...image, albumTitle: album.title })),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      {categories.length > 1 && (
        <div className="mb-9 flex flex-wrap gap-x-5 gap-y-3 border-b border-line pb-5">
          {["All", ...categories].map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setActive(category)}
              className={cn(
                "border-b pb-1 text-sm font-semibold transition-colors",
                active === category
                  ? "border-bhumi text-bhumi"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      {images.length > 0 ? (
        <GalleryGrid images={images} />
      ) : (
        <p className="border border-dashed border-line bg-canvas px-6 py-9 text-sm leading-6 text-muted">
          There are no images in this category yet.
        </p>
      )}
    </div>
  );
}

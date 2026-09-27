"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { MediaFrame } from "./media-frame";

export type GalleryGridImage = {
  id: string;
  image: string;
  altText?: string | null;
  caption?: string | null;
  albumTitle?: string | null;
};

export function GalleryGrid({
  images,
  compact = false,
}: {
  images: GalleryGridImage[];
  compact?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (active === null) return;
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight")
        setActive((current) =>
          current === null ? null : (current + 1) % images.length,
        );
      if (event.key === "ArrowLeft")
        setActive((current) =>
          current === null
            ? null
            : (current - 1 + images.length) % images.length,
        );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, images.length]);

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4",
          compact && "md:grid-cols-4",
        )}
      >
        {images.map((image, index) => (
          <button
            type="button"
            key={image.id}
            onClick={() => setActive(index)}
            className={cn(
              "group relative overflow-hidden text-left",
              index % 5 === 0
                ? "col-span-2 row-span-2 aspect-square"
                : "aspect-[1/1.15]",
              compact && index % 5 === 0 && "row-span-1 aspect-[1.25/1]",
            )}
            aria-label={`Open image: ${image.altText || image.caption || image.albumTitle || "gallery image"}`}
          >
            <MediaFrame
              src={image.image}
              alt={image.altText}
              className="h-full w-full"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {(image.caption || image.albumTitle) && (
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/80 px-4 py-3 text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
                {image.caption || image.albumTitle}
              </span>
            )}
          </button>
        ))}
      </div>

      {active !== null && images[active] && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-ink/95 p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <button
            type="button"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center border border-white/25 text-white transition-colors hover:bg-white hover:text-ink"
            onClick={() => setActive(null)}
            aria-label="Close image viewer"
          >
            <X size={21} />
          </button>
          <button
            type="button"
            className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-white/25 text-white hover:bg-white hover:text-ink md:left-8"
            onClick={() =>
              setActive((value) =>
                value === null
                  ? null
                  : (value - 1 + images.length) % images.length,
              )
            }
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
          <figure className="relative flex h-full w-full max-w-6xl flex-col justify-center py-16">
            <div className="relative min-h-0 flex-1">
              <Image
                src={images[active].image}
                alt={images[active].altText || ""}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            {(images[active].caption || images[active].albumTitle) && (
              <figcaption className="pt-4 text-center text-sm text-white/75">
                {images[active].caption || images[active].albumTitle}
              </figcaption>
            )}
          </figure>
          <button
            type="button"
            className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-white/25 text-white hover:bg-white hover:text-ink md:right-8"
            onClick={() =>
              setActive((value) =>
                value === null ? null : (value + 1) % images.length,
              )
            }
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </>
  );
}

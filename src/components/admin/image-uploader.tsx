"use client";

import { ImageIcon, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { uploadImageAction } from "@/app/actions/admin";

const acceptedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const maxUploadBytes = 8 * 1024 * 1024;

export function ImageUploader({
  name,
  value = "",
  previewUrl = "",
  onChange,
  folder = "uploads",
  label = "Image",
  hint = "JPEG, PNG, WebP, or AVIF up to 8 MB.",
}: {
  name: string;
  value?: string;
  previewUrl?: string;
  onChange?: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
}) {
  const inputId = useId();
  const [isPending, startTransition] = useTransition();
  const [storedPath, setStoredPath] = useState(value);
  const [preview, setPreview] = useState(previewUrl);

  function setValue(path: string, nextPreview = "") {
    setStoredPath(path);
    setPreview(nextPreview);
    onChange?.(path);
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!acceptedTypes.has(file.type)) {
      toast.error("Choose a JPEG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size > maxUploadBytes) {
      toast.error("Image files must be 8 MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      URL.revokeObjectURL(localPreview);
      if (!result.ok || !result.path || !result.url) {
        setPreview(previewUrl);
        toast.error(result.message);
        return;
      }
      setValue(result.path, result.url);
      toast.success("Image uploaded.");
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {preview ? (
          <button
            type="button"
            onClick={() => setValue("")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Clear field
          </button>
        ) : null}
      </div>
      <input type="hidden" name={name} value={storedPath} />
      <label
        htmlFor={inputId}
        className="group relative flex min-h-44 cursor-pointer items-center justify-center overflow-hidden border border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-bhumi hover:bg-bhumi-light/40"
      >
        {preview ? (
          // This is a private editor preview; a raw image avoids requiring every Supabase hostname in next.config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Selected upload preview"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span className="flex flex-col items-center px-5 text-center">
            <ImageIcon className="size-6 text-bhumi" aria-hidden="true" />
            <span className="mt-3 text-sm font-semibold text-ink">
              Upload image
            </span>
            <span className="mt-1 text-xs text-muted">{hint}</span>
          </span>
        )}
        <span className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-2 bg-ink px-3 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {isPending ? (
            <LoaderCircle
              className="size-3.5 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Upload className="size-3.5" aria-hidden="true" />
          )}
          {isPending ? "Uploading" : "Replace"}
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        className="sr-only"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={isPending}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {!preview ? (
        <p className="mt-2 text-xs leading-5 text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

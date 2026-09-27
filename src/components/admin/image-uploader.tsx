"use client";

import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

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
  label = "Image",
  hint = "Public media: JPEG, PNG, WebP, or AVIF up to 8 MB. The file is uploaded only when you save this form.",
}: {
  name: string;
  value?: string;
  previewUrl?: string;
  label?: string;
  hint?: string;
}) {
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [storedPath, setStoredPath] = useState(value);
  const [preview, setPreview] = useState(previewUrl);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function setPreviewUrl(nextPreview: string) {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(nextPreview);
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!acceptedTypes.has(file.type)) {
      toast.error("Choose a JPEG, PNG, WebP, or AVIF image.");
      return;
    }
    if (file.size === 0 || file.size > maxUploadBytes) {
      toast.error("Image files must be between 1 byte and 8 MB.");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    if (fileInput.current) fileInput.current.value = "";
    setStoredPath("");
    setPreviewUrl("");
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
            onClick={clearImage}
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
          // A selected local file needs a raw preview URL before it is saved.
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
              Choose image
            </span>
            <span className="mt-1 text-xs text-muted">{hint}</span>
          </span>
        )}
        <span className="absolute bottom-3 right-3 inline-flex min-h-9 items-center gap-2 bg-ink px-3 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Upload className="size-3.5" aria-hidden="true" />
          {preview ? "Replace" : "Choose file"}
        </span>
      </label>
      <input
        ref={fileInput}
        id={inputId}
        name={`${name}_file`}
        type="file"
        className="sr-only"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <p className="mt-2 text-xs leading-5 text-muted">{hint}</p>
    </div>
  );
}

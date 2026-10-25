"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { prepareProjectImageUploadAction } from "@/app/actions/admin";
import { imageFileError } from "@/lib/media/image-validation";
import { createClient } from "@/lib/supabase/client";

type ProjectUploadKind =
  "project-create" | "project-update" | "image-create" | "image-update";

export function ProjectUploadForm({
  action,
  kind,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  kind: ProjectUploadKind;
  children: ReactNode;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const imageField = kind.startsWith("project-")
      ? "cover_image_path"
      : "image_path";
    const fileInput = form.elements.namedItem(
      `${imageField}_file`,
    ) as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file || file.size === 0) return;

    event.preventDefault();
    if (uploading) return;
    const formData = new FormData(form);
    formData.delete(`${imageField}_file`);
    for (const name of formData.keys()) {
      if (name.startsWith("$ACTION_")) formData.delete(name);
    }

    const validationError = await imageFileError(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading image…");
    let uploadedPath: string;
    try {
      const prepared = await prepareProjectImageUploadAction(
        kind,
        formData,
        file.type,
        file.size,
      );
      if ("error" in prepared) throw new Error(prepared.error);
      const { error } = await createClient()
        .storage.from("media")
        .uploadToSignedUrl(prepared.path, prepared.token, file, {
          contentType: file.type,
        });
      if (error)
        throw new Error("The image could not be uploaded. Please try again.");
      uploadedPath = prepared.path;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The image could not be saved.",
      );
      setUploading(false);
      return;
    } finally {
      toast.dismiss(toastId);
    }

    formData.set(imageField, uploadedPath);
    try {
      await action(formData);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className={className}
      aria-busy={uploading}
    >
      <fieldset disabled={uploading} className="contents">
        {children}
      </fieldset>
    </form>
  );
}

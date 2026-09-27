import {
  createGalleryImageAction,
  createProjectImageAction,
  deleteGalleryImageAction,
  deleteProjectImageAction,
  updateGalleryImageAction,
  updateProjectImageAction,
} from "@/app/actions/admin";

import type { AdminImage } from "./admin-data";
import { ConfirmDialog } from "./confirm-dialog";
import { FormSection, TextField } from "./form-fields";
import { ImageUploader } from "./image-uploader";
import { publicMediaUrl } from "./media-url";
import { SubmitButton } from "./submit-button";

type FormAction = (formData: FormData) => void | Promise<void>;

export function ImageCollectionManager({
  kind,
  parentId,
  images,
}: {
  kind: "project" | "gallery";
  parentId: string;
  images: AdminImage[];
}) {
  const config =
    kind === "project"
      ? {
          addAction: createProjectImageAction,
          deleteAction: deleteProjectImageAction,
          idField: "project_id",
          folder: "projects",
          singular: "project image",
          updateAction: updateProjectImageAction,
        }
      : {
          addAction: createGalleryImageAction,
          deleteAction: deleteGalleryImageAction,
          idField: "album_id",
          folder: "gallery",
          singular: "gallery image",
          updateAction: updateGalleryImageAction,
        };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FormSection
        title="Add image"
        description="Images are stored in the media library. Use the display order to control the public sequence."
      >
        <form action={config.addAction as FormAction} className="contents">
          <input type="hidden" name={config.idField} value={parentId} />
          <div className="md:col-span-2">
            <ImageUploader
              name="image_path"
              folder={config.folder}
              label="Image file"
            />
          </div>
          <TextField
            label="Alt text"
            name="alt_text"
            hint="Describe the image for visitors"
          />
          <TextField label="Caption" name="caption" />
          <TextField
            label="Display order"
            name="sort_order"
            type="number"
            min="0"
            step="1"
            defaultValue={images.length}
          />
          <div className="flex items-end">
            <SubmitButton pendingLabel="Adding">Add image</SubmitButton>
          </div>
        </form>
      </FormSection>

      <section className="border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">
            Images ({images.length})
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Edit captions, alt text, or display order without reuploading the
            file.
          </p>
        </div>
        {images.length ? (
          <div className="divide-y divide-line">
            {images.map((item) => {
              const preview = publicMediaUrl(item.imagePath);
              return (
                <div
                  key={item.id}
                  className="grid gap-4 p-5 lg:grid-cols-[9rem_1fr]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    {preview ? (
                      // Admin previews receive trusted paths from storage and do not need remote Image config.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt={item.altText ?? ""}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center px-3 text-center text-xs text-muted">
                        Image preview unavailable
                      </span>
                    )}
                  </div>
                  <form
                    action={config.updateAction as FormAction}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name={config.idField}
                      value={parentId}
                    />
                    <input
                      type="hidden"
                      name="image_path"
                      value={item.imagePath}
                    />
                    <TextField
                      label="Alt text"
                      name="alt_text"
                      defaultValue={item.altText ?? ""}
                    />
                    <TextField
                      label="Caption"
                      name="caption"
                      defaultValue={item.caption ?? ""}
                    />
                    <TextField
                      label="Display order"
                      name="sort_order"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={item.sortOrder}
                    />
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <SubmitButton pendingLabel="Updating">
                        Save image
                      </SubmitButton>
                      <ConfirmDialog
                        trigger={
                          <button
                            type="button"
                            className="min-h-10 px-2 text-sm font-semibold text-red-700 hover:text-red-800"
                          >
                            Delete
                          </button>
                        }
                        title={`Delete ${config.singular}?`}
                        description="This will permanently remove the image record. It cannot be restored from the admin panel."
                        action={config.deleteAction as FormAction}
                        values={{ id: item.id, [config.idField]: parentId }}
                      />
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-10 text-sm text-muted">
            No images have been added yet.
          </p>
        )}
      </section>
    </div>
  );
}

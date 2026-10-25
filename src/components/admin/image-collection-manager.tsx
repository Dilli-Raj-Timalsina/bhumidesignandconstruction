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
import { ProjectUploadForm } from "./project-upload-form";
import { SubmitButton } from "./submit-button";

type FormAction = (formData: FormData) => Promise<void>;

function ImageForm({
  kind,
  mode,
  action,
  children,
  className,
}: {
  kind: "project" | "gallery";
  mode: "create" | "update";
  action: FormAction;
  children: React.ReactNode;
  className: string;
}) {
  return kind === "project" ? (
    <ProjectUploadForm
      action={action}
      kind={mode === "create" ? "image-create" : "image-update"}
      className={className}
    >
      {children}
    </ProjectUploadForm>
  ) : (
    <form action={action} className={className}>
      {children}
    </form>
  );
}

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
          singular: "project image",
          updateAction: updateProjectImageAction,
        }
      : {
          addAction: createGalleryImageAction,
          deleteAction: deleteGalleryImageAction,
          idField: "album_id",
          singular: "gallery image",
          updateAction: updateGalleryImageAction,
        };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FormSection
        title="Add image"
        description="Images are stored in the media library. Use the display order to control the public sequence."
      >
        <ImageForm
          kind={kind}
          mode="create"
          action={config.addAction}
          className="contents"
        >
          <input type="hidden" name={config.idField} value={parentId} />
          <div className="md:col-span-2">
            <ImageUploader name="image_path" label="Image file" />
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
        </ImageForm>
      </FormSection>

      <section className="border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">
            Images ({images.length})
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {kind === "project"
              ? "Replace a photo or edit its caption, alt text, and display order."
              : "Edit captions, alt text, or display order without reuploading the file."}
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
                  <ImageForm
                    kind={kind}
                    mode="update"
                    action={config.updateAction}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      type="hidden"
                      name={config.idField}
                      value={parentId}
                    />
                    {kind === "project" ? (
                      <div className="sm:col-span-2">
                        <ImageUploader
                          key={item.imagePath}
                          name="image_path"
                          value={item.imagePath}
                          previewUrl={preview}
                          label="Replace photo"
                          clearLabel="Undo selection"
                          restoreOnClear
                        />
                      </div>
                    ) : (
                      <input
                        type="hidden"
                        name="image_path"
                        value={item.imagePath}
                      />
                    )}
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
                  </ImageForm>
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

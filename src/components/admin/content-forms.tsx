import type { ReactNode } from "react";

import {
  createGalleryAlbumAction,
  createPostAction,
  createProjectAction,
  createServiceAction,
  updateGalleryAlbumAction,
  updatePostAction,
  updateProjectAction,
  updateServiceAction,
} from "@/app/actions/admin";

import type {
  AdminAlbum,
  AdminPost,
  AdminProject,
  AdminService,
} from "./admin-data";
import {
  CheckboxField,
  FormActions,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "./form-fields";
import { ImageUploader } from "./image-uploader";
import { publicMediaUrl } from "./media-url";
import { RichTextEditor } from "./rich-text-editor";

function optional(value: string | null | undefined): string {
  return value ?? "";
}

function dateValue(value: string | null | undefined): string {
  return value?.slice(0, 10) ?? "";
}

function FormLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl space-y-5">{children}</div>;
}

export function ProjectForm({ project }: { project?: AdminProject }) {
  const editing = Boolean(project);
  const action = editing ? updateProjectAction : createProjectAction;

  return (
    <form action={action} encType="multipart/form-data" className="space-y-5">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <FormLayout>
        <FormSection
          title="Project details"
          description="Use the project information supported by your records."
        >
          <TextField
            label="Title"
            name="title"
            required
            defaultValue={optional(project?.title)}
            autoComplete="off"
          />
          <TextField
            label="Slug"
            name="slug"
            hint="Lowercase URL identifier"
            required
            defaultValue={optional(project?.slug)}
            autoComplete="off"
          />
          <TextField
            label="Category"
            name="category"
            defaultValue={optional(project?.category)}
          />
          <TextField
            label="Location"
            name="location"
            defaultValue={optional(project?.location)}
          />
          <TextField
            label="Client"
            name="client"
            defaultValue={optional(project?.client)}
          />
          <TextField
            label="Main contractor"
            name="main_contractor"
            defaultValue={optional(project?.mainContractor)}
          />
          <TextField
            label="Financing"
            name="financing"
            defaultValue={optional(project?.financing)}
          />
          <TextField
            label="Project status"
            name="project_status"
            hint="For example, ongoing or completed"
            defaultValue={optional(project?.projectStatus)}
          />
          <TextAreaField
            label="Overview"
            name="description"
            className="md:col-span-2"
            defaultValue={optional(project?.description)}
            rows={5}
          />
          <TextAreaField
            label="Scope of work"
            name="scope_of_work"
            className="md:col-span-2"
            defaultValue={optional(project?.scopeOfWork)}
            rows={5}
          />
          <TextAreaField
            label="Execution details"
            name="execution_details"
            className="md:col-span-2"
            defaultValue={optional(project?.executionDetails)}
            rows={5}
          />
        </FormSection>

        <FormSection
          title="Publication"
          description="Only published projects appear on the public website."
        >
          <SelectField
            label="Visibility"
            name="status"
            required
            defaultValue={project?.status ?? "draft"}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </SelectField>
          <TextField
            label="Published date"
            name="published_at"
            type="date"
            defaultValue={dateValue(project?.publishedAt)}
          />
          <TextField
            label="Start date"
            name="start_date"
            type="date"
            defaultValue={dateValue(project?.startDate)}
          />
          <TextField
            label="Completion date"
            name="completion_date"
            type="date"
            defaultValue={dateValue(project?.completionDate)}
          />
          <TextField
            label="Manpower"
            name="manpower"
            defaultValue={optional(project?.manpower)}
          />
          <TextField
            label="Display order"
            name="sort_order"
            type="number"
            min="0"
            step="1"
            defaultValue={project?.sortOrder ?? 0}
          />
          <CheckboxField
            name="featured"
            label="Feature this project"
            hint="Featured projects may be highlighted on the website."
            defaultChecked={project?.featured}
          />
        </FormSection>

        <FormSection
          title="Cover image"
          description="Upload an image from this project. Add additional project images after saving."
        >
          <div className="md:col-span-2">
            <ImageUploader
              name="cover_image_path"
              value={optional(project?.coverImagePath)}
              previewUrl={publicMediaUrl(project?.coverImagePath)}
              label="Project cover image"
            />
          </div>
        </FormSection>

        <FormSection
          title="Search metadata"
          description="Optional metadata used by search and social previews."
        >
          <TextField
            label="SEO title"
            name="seo_title"
            defaultValue={optional(project?.seoTitle)}
          />
          <TextAreaField
            label="SEO description"
            name="seo_description"
            defaultValue={optional(project?.seoDescription)}
            rows={3}
          />
        </FormSection>
        <FormActions
          cancelHref="/admin/projects"
          submitLabel={editing ? "Save project" : "Create project"}
        />
      </FormLayout>
    </form>
  );
}

export function ServiceForm({ service }: { service?: AdminService }) {
  const editing = Boolean(service);
  const action = editing ? updateServiceAction : createServiceAction;

  return (
    <form action={action} encType="multipart/form-data" className="space-y-5">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <FormLayout>
        <FormSection
          title="Service details"
          description="Keep descriptions specific to current capabilities."
        >
          <TextField
            label="Title"
            name="title"
            required
            defaultValue={optional(service?.title)}
            autoComplete="off"
          />
          <TextField
            label="Slug"
            name="slug"
            hint="Lowercase URL identifier"
            required
            defaultValue={optional(service?.slug)}
            autoComplete="off"
          />
          <TextField
            label="Icon"
            name="icon"
            hint="Optional Lucide icon name"
            defaultValue={optional(service?.icon)}
          />
          <TextField
            label="Display order"
            name="sort_order"
            type="number"
            min="0"
            step="1"
            defaultValue={service?.sortOrder ?? 0}
          />
          <TextAreaField
            label="Short description"
            name="short_description"
            className="md:col-span-2"
            defaultValue={optional(service?.shortDescription)}
            rows={3}
          />
          <TextAreaField
            label="Full description"
            name="description"
            className="md:col-span-2"
            defaultValue={optional(service?.description)}
            rows={6}
          />
        </FormSection>
        <FormSection
          title="Publication"
          description="Only published services appear publicly."
        >
          <SelectField
            label="Visibility"
            name="status"
            required
            defaultValue={service?.status ?? "draft"}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </SelectField>
          <TextField
            label="Published date"
            name="published_at"
            type="date"
            defaultValue={dateValue(service?.publishedAt)}
          />
          <CheckboxField
            name="featured"
            label="Feature this service"
            defaultChecked={service?.featured}
          />
        </FormSection>
        <FormSection title="Cover image">
          <div className="md:col-span-2">
            <ImageUploader
              name="cover_image_path"
              value={optional(service?.coverImagePath)}
              previewUrl={publicMediaUrl(service?.coverImagePath)}
              label="Service cover image"
            />
          </div>
        </FormSection>
        <FormSection
          title="Search metadata"
          description="Optional metadata used by search and social previews."
        >
          <TextField
            label="SEO title"
            name="seo_title"
            defaultValue={optional(service?.seoTitle)}
          />
          <TextAreaField
            label="SEO description"
            name="seo_description"
            defaultValue={optional(service?.seoDescription)}
            rows={3}
          />
        </FormSection>
        <FormActions
          cancelHref="/admin/services"
          submitLabel={editing ? "Save service" : "Create service"}
        />
      </FormLayout>
    </form>
  );
}

export function GalleryAlbumForm({ album }: { album?: AdminAlbum }) {
  const editing = Boolean(album);
  const action = editing ? updateGalleryAlbumAction : createGalleryAlbumAction;

  return (
    <form action={action} encType="multipart/form-data" className="space-y-5">
      {album ? <input type="hidden" name="id" value={album.id} /> : null}
      <FormLayout>
        <FormSection
          title="Album details"
          description="Albums help visitors understand how images belong together."
        >
          <TextField
            label="Title"
            name="title"
            required
            defaultValue={optional(album?.title)}
            autoComplete="off"
          />
          <TextField
            label="Slug"
            name="slug"
            hint="Lowercase URL identifier"
            required
            defaultValue={optional(album?.slug)}
            autoComplete="off"
          />
          <TextField
            label="Category"
            name="category"
            defaultValue={optional(album?.category)}
          />
          <TextField
            label="Display order"
            name="sort_order"
            type="number"
            min="0"
            step="1"
            defaultValue={album?.sortOrder ?? 0}
          />
          <TextAreaField
            label="Description"
            name="description"
            className="md:col-span-2"
            defaultValue={optional(album?.description)}
            rows={5}
          />
        </FormSection>
        <FormSection
          title="Publication"
          description="Only published albums and their images appear publicly."
        >
          <SelectField
            label="Visibility"
            name="status"
            required
            defaultValue={album?.status ?? "draft"}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </SelectField>
          <TextField
            label="Published date"
            name="published_at"
            type="date"
            defaultValue={dateValue(album?.publishedAt)}
          />
          <CheckboxField
            name="featured"
            label="Feature this album"
            defaultChecked={album?.featured}
          />
        </FormSection>
        <FormSection
          title="Cover image"
          description="Choose an image from the album once it is saved, or upload one now."
        >
          <div className="md:col-span-2">
            <ImageUploader
              name="cover_image_path"
              value={optional(album?.coverImagePath)}
              previewUrl={publicMediaUrl(album?.coverImagePath)}
              label="Album cover image"
            />
          </div>
        </FormSection>
        <FormActions
          cancelHref="/admin/gallery"
          submitLabel={editing ? "Save album" : "Create album"}
        />
      </FormLayout>
    </form>
  );
}

export function PostForm({ post }: { post?: AdminPost }) {
  const editing = Boolean(post);
  const action = editing ? updatePostAction : createPostAction;

  return (
    <form action={action} encType="multipart/form-data" className="space-y-5">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <FormLayout>
        <FormSection
          title="Article details"
          description="Write only content ready for Bhumi’s public insights section."
        >
          <TextField
            label="Title"
            name="title"
            required
            defaultValue={optional(post?.title)}
            autoComplete="off"
          />
          <TextField
            label="Slug"
            name="slug"
            hint="Lowercase URL identifier"
            required
            defaultValue={optional(post?.slug)}
            autoComplete="off"
          />
          <TextField
            label="Category"
            name="category"
            defaultValue={optional(post?.category)}
          />
          <TextField
            label="Author"
            name="author"
            defaultValue={optional(post?.author)}
          />
          <TextField
            label="Tags"
            name="tags"
            hint="Separate tags with commas"
            defaultValue={post?.tags.join(", ") ?? ""}
          />
          <TextAreaField
            label="Excerpt"
            name="excerpt"
            className="md:col-span-2"
            defaultValue={optional(post?.excerpt)}
            rows={3}
          />
        </FormSection>
        <FormSection
          title="Article body"
          description="Use the editor for formatted article content."
        >
          <div className="md:col-span-2">
            <RichTextEditor
              name="content"
              initialContent={optional(post?.content)}
              required
            />
          </div>
        </FormSection>
        <FormSection
          title="Publication"
          description="Only published posts appear on the public website."
        >
          <SelectField
            label="Visibility"
            name="status"
            required
            defaultValue={post?.status ?? "draft"}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </SelectField>
          <TextField
            label="Published date"
            name="published_at"
            type="date"
            defaultValue={dateValue(post?.publishedAt)}
          />
        </FormSection>
        <FormSection title="Cover image">
          <div className="md:col-span-2">
            <ImageUploader
              name="cover_image_path"
              value={optional(post?.coverImagePath)}
              previewUrl={publicMediaUrl(post?.coverImagePath)}
              label="Article cover image"
            />
          </div>
        </FormSection>
        <FormSection
          title="Search metadata"
          description="Optional metadata used by search and social previews."
        >
          <TextField
            label="SEO title"
            name="seo_title"
            defaultValue={optional(post?.seoTitle)}
          />
          <TextAreaField
            label="SEO description"
            name="seo_description"
            defaultValue={optional(post?.seoDescription)}
            rows={3}
          />
        </FormSection>
        <FormActions
          cancelHref="/admin/posts"
          submitLabel={editing ? "Save article" : "Create article"}
        />
      </FormLayout>
    </form>
  );
}

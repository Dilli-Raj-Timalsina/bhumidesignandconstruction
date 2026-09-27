import { updateSiteSettingsAction } from "@/app/actions/admin";

import type { AdminSettings } from "./admin-data";
import {
  FormActions,
  FormSection,
  TextAreaField,
  TextField,
} from "./form-fields";
import { ImageUploader } from "./image-uploader";
import { publicMediaUrl } from "./media-url";

function optional(value: string | null | undefined): string {
  return value ?? "";
}

export function SettingsForm({ settings }: { settings: AdminSettings }) {
  return (
    <form
      action={updateSiteSettingsAction}
      className="mx-auto max-w-5xl space-y-5"
    >
      {settings.id ? (
        <input type="hidden" name="id" value={settings.id} />
      ) : null}
      <FormSection
        title="Company identity"
        description="These fields support the website header, footer, and primary company information."
      >
        <TextField
          label="Company name"
          name="company_name"
          required
          defaultValue={settings.companyName}
        />
        <TextField
          label="Short name"
          name="short_name"
          required
          defaultValue={settings.shortName}
        />
        <TextField
          label="Tagline"
          name="tagline"
          defaultValue={optional(settings.tagline)}
        />
        <TextField
          label="Location"
          name="location"
          defaultValue={optional(settings.location)}
        />
        <TextAreaField
          label="Short description"
          name="description"
          className="md:col-span-2"
          defaultValue={optional(settings.description)}
          rows={4}
        />
      </FormSection>

      <FormSection
        title="Brand mark"
        description="Upload the supplied Bhumi logo without redesigning it."
      >
        <div className="md:col-span-2">
          <ImageUploader
            name="logo_path"
            value={optional(settings.logoPath)}
            previewUrl={publicMediaUrl(settings.logoPath)}
            folder="site"
            label="Logo"
          />
        </div>
      </FormSection>

      <FormSection
        title="Contact information"
        description="Only enter details that are current and approved for publication."
      >
        <TextAreaField
          label="Address"
          name="address"
          defaultValue={optional(settings.address)}
          rows={3}
        />
        <div className="space-y-5">
          <TextField
            label="Email"
            name="email"
            type="email"
            defaultValue={optional(settings.email)}
          />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={optional(settings.phone)}
          />
        </div>
      </FormSection>

      <FormSection
        title="About content"
        description="Use this content on the company overview sections."
      >
        <TextField
          label="About heading"
          name="about_title"
          defaultValue={optional(settings.aboutTitle)}
        />
        <TextAreaField
          label="About content"
          name="about_content"
          className="md:col-span-2"
          defaultValue={optional(settings.aboutContent)}
          rows={7}
        />
      </FormSection>

      <FormSection
        title="Page images"
        description="Use real project imagery approved for the website."
      >
        <TextField
          label="Hero heading"
          name="hero_title"
          className="md:col-span-2"
          defaultValue={optional(settings.heroTitle)}
        />
        <TextAreaField
          label="Hero description"
          name="hero_description"
          className="md:col-span-2"
          defaultValue={optional(settings.heroDescription)}
          rows={4}
        />
        <ImageUploader
          name="hero_image_path"
          value={optional(settings.heroImagePath)}
          previewUrl={publicMediaUrl(settings.heroImagePath)}
          folder="site"
          label="Hero image"
        />
        <ImageUploader
          name="about_image_path"
          value={optional(settings.aboutImagePath)}
          previewUrl={publicMediaUrl(settings.aboutImagePath)}
          folder="site"
          label="About image"
        />
      </FormSection>

      <FormSection
        title="Social links"
        description="Leave a field blank when the account is not configured."
      >
        <TextField
          label="Facebook URL"
          name="social_facebook"
          type="url"
          defaultValue={settings.socialLinks.facebook ?? ""}
        />
        <TextField
          label="Instagram URL"
          name="social_instagram"
          type="url"
          defaultValue={settings.socialLinks.instagram ?? ""}
        />
        <TextField
          label="LinkedIn URL"
          name="social_linkedin"
          type="url"
          defaultValue={settings.socialLinks.linkedin ?? ""}
        />
      </FormSection>
      <FormSection
        title="Default SEO"
        description="Fallback metadata for pages without their own title or description."
      >
        <TextField
          label="Default SEO title"
          name="default_seo_title"
          defaultValue={optional(settings.defaultSeoTitle)}
        />
        <TextAreaField
          label="Default SEO description"
          name="default_seo_description"
          defaultValue={optional(settings.defaultSeoDescription)}
          rows={3}
        />
      </FormSection>
      <FormActions cancelHref="/admin/dashboard" submitLabel="Save settings" />
    </form>
  );
}

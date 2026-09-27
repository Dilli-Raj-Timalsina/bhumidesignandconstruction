import { PhoneCall, ShieldCheck } from "lucide-react";

import { updateContactDetailsAction } from "@/app/actions/admin";

import type { AdminSettings } from "./admin-data";
import { EmptyState } from "./empty-state";
import {
  FormActions,
  FormSection,
  TextAreaField,
  TextField,
} from "./form-fields";

function optional(value: string | null | undefined): string {
  return value ?? "";
}

export function ContactDetailsForm({ settings }: { settings: AdminSettings }) {
  if (!settings.id) {
    return (
      <EmptyState
        title="Set up your site settings first"
        description="Create the global company settings record before maintaining its public contact details."
        action={{ href: "/admin/settings", label: "Open settings" }}
        icon={<PhoneCall className="size-5" aria-hidden="true" />}
      />
    );
  }

  return (
    <form
      action={updateContactDetailsAction}
      className="mx-auto max-w-3xl space-y-5"
    >
      <input type="hidden" name="id" value={settings.id} />

      <section className="border border-bhumi/20 bg-bhumi-light/40 px-5 py-4">
        <div className="flex gap-3">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-bhumi"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-sm font-semibold text-ink">
              Protected public information
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Only authorized administrators can save these fields. Updates are
              validated on the server and enforced by database row-level
              security before they reach the public website.
            </p>
          </div>
        </div>
      </section>

      <FormSection
        title="Public contact details"
        description="These details appear across the website footer and contact page after you save them."
      >
        <TextField
          label="Location"
          name="location"
          autoComplete="organization"
          defaultValue={optional(settings.location)}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={optional(settings.email)}
        />
        <TextAreaField
          label="Address"
          name="address"
          className="md:col-span-2"
          defaultValue={optional(settings.address)}
          rows={3}
        />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={optional(settings.phone)}
        />
      </FormSection>

      <FormActions
        cancelHref="/admin/dashboard"
        submitLabel="Save contact details"
      />
    </form>
  );
}

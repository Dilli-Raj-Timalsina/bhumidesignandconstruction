import Link from "next/link";

import { getAdminSettings } from "@/components/admin/admin-data";
import { PageContentForm } from "@/components/admin/page-content-form";
import { PageHeader } from "@/components/admin/page-header";

export default async function PageContentPage() {
  const settings = await getAdminSettings();
  return (
    <>
      <PageHeader
        title="Page content"
        description="Edit homepage, About, process, contact, and shared banner copy."
      />
      {settings.editorialAvailable ? (
        <PageContentForm initial={settings.editorial} />
      ) : (
        <div className="border border-line bg-white p-6 text-sm leading-7 text-ink">
          Apply the editorial content migration before editing these sections.
          See{" "}
          <Link
            href="/admin/settings"
            className="font-semibold text-bhumi underline"
          >
            Settings
          </Link>{" "}
          for the existing company and hero fields.
        </div>
      )}
    </>
  );
}

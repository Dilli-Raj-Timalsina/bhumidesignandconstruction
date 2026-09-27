import { getAdminSettings } from "@/components/admin/admin-data";
import { ContactDetailsForm } from "@/components/admin/contact-details-form";
import { PageHeader } from "@/components/admin/page-header";

export default async function AdminContactPage() {
  const settings = await getAdminSettings();

  return (
    <>
      <PageHeader
        title="Contact details"
        description="Maintain the public phone, email, location, and address shown to prospective clients."
      />
      <ContactDetailsForm settings={settings} />
    </>
  );
}

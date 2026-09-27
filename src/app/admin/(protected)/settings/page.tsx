import { getAdminSettings } from "@/components/admin/admin-data";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const settings = await getAdminSettings();
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage company details and global website content."
      />
      <SettingsForm settings={settings} />
    </>
  );
}

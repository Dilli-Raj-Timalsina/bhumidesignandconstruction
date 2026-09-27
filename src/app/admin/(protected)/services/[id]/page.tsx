import { notFound } from "next/navigation";

import { getAdminService } from "@/components/admin/admin-data";
import { ServiceForm } from "@/components/admin/content-forms";
import { PageHeader } from "@/components/admin/page-header";

type ServiceEditPageProps = { params: Promise<{ id: string }> };

export default async function ServiceEditPage({
  params,
}: ServiceEditPageProps) {
  const service = await getAdminService((await params).id);
  if (!service) notFound();
  return (
    <>
      <PageHeader
        title="Edit service"
        description="Update its description, visibility, and cover image."
        backHref="/admin/services"
      />
      <ServiceForm service={service} />
    </>
  );
}

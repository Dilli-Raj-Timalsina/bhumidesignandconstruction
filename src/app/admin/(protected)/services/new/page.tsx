import { ServiceForm } from "@/components/admin/content-forms";
import { PageHeader } from "@/components/admin/page-header";

export default function NewServicePage() {
  return (
    <>
      <PageHeader
        title="New service"
        description="Create a draft capability and publish it when its information is ready."
        backHref="/admin/services"
      />
      <ServiceForm />
    </>
  );
}

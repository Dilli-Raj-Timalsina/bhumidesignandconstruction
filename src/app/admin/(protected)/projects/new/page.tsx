import { ProjectForm } from "@/components/admin/content-forms";
import { PageHeader } from "@/components/admin/page-header";

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        title="New project"
        description="Create a private draft first, then publish it when all facts and imagery are ready."
        backHref="/admin/projects"
      />
      <ProjectForm />
    </>
  );
}

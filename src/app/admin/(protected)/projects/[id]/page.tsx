import { notFound } from "next/navigation";

import {
  getAdminProject,
  getProjectImages,
} from "@/components/admin/admin-data";
import { ProjectForm } from "@/components/admin/content-forms";
import { ImageCollectionManager } from "@/components/admin/image-collection-manager";
import { PageHeader } from "@/components/admin/page-header";

type ProjectEditPageProps = { params: Promise<{ id: string }> };

export default async function ProjectEditPage({
  params,
}: ProjectEditPageProps) {
  const { id } = await params;
  const [project, images] = await Promise.all([
    getAdminProject(id),
    getProjectImages(id),
  ]);
  if (!project) notFound();
  return (
    <>
      <PageHeader
        title="Edit project"
        description="Update content, publication details, and imagery."
        backHref="/admin/projects"
      />
      <ProjectForm project={project} />
      <div className="mt-10 border-t border-line pt-10">
        <ImageCollectionManager
          kind="project"
          parentId={project.id}
          images={images}
        />
      </div>
    </>
  );
}

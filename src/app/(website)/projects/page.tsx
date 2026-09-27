import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { ContentEmptyState } from "@/components/website/empty-content";
import { ProjectCard } from "@/components/website/project-card";
import { getProjects } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected project work by BHUMI Design & Construction.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <section className="border-b border-line bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <p className="eyebrow">Projects</p>
          <h1 className="display-title mt-6 max-w-5xl">
            A body of work built with care.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            Project case studies are published as their verified information and
            photography are ready to share.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-28">
        <div className="site-shell">
          {projects.length > 0 ? (
            <div className="grid gap-x-7 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <ContentEmptyState
              title="Projects will be published here."
              detail="Add validated project information, photography and project scope through the admin workspace."
            />
          )}
          <ButtonLink href="/contact" variant="text" className="mt-12">
            Have a project in mind? <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

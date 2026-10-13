import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { ContentEmptyState } from "@/components/website/empty-content";
import { ProjectCard } from "@/components/website/project-card";
import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getProjects, getSiteContent } from "@/features/content/queries";

export const generateMetadata = () =>
  getPageIntroMetadata("projects", "/projects");

export default async function ProjectsPage() {
  const [projects, site] = await Promise.all([getProjects(), getSiteContent()]);
  return (
    <>
      <PageIntro page="projects" intro={site.pageIntros.projects} />
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
              title="Project records are being updated."
              detail="Verified project details and portfolio photography will appear here shortly."
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

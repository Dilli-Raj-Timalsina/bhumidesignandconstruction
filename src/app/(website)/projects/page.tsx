import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { ContentEmptyState } from "@/components/website/empty-content";
import { ProjectCard } from "@/components/website/project-card";
import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import {
  projectStageLabels,
  projectStages,
  readProjectStage,
  type ProjectStage,
} from "@/features/content/project-stage";
import { getProjects, getSiteContent } from "@/features/content/queries";

export const generateMetadata = () =>
  getPageIntroMetadata("projects", "/projects");

type ProjectsPageProps = {
  searchParams: Promise<{ stage?: string | string[] }>;
};

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const stageValue = (await searchParams).stage;
  const stage = readProjectStage(
    Array.isArray(stageValue) ? stageValue[0] : stageValue,
  );
  const [projects, site] = await Promise.all([getProjects(), getSiteContent()]);
  const filteredProjects = stage
    ? projects.filter((project) => project.stage === stage)
    : projects;
  const counts: Record<"all" | ProjectStage, number> = {
    all: projects.length,
    completed: 0,
    ongoing: 0,
    upcoming: 0,
  };
  for (const project of projects) {
    if (project.stage) counts[project.stage] += 1;
  }
  const tabs = [
    { value: "all", label: "All", href: "/projects" },
    ...projectStages.map((value) => ({
      value,
      label: projectStageLabels[value],
      href: `/projects?stage=${value}`,
    })),
  ] as const;

  return (
    <>
      <PageIntro page="projects" intro={site.pageIntros.projects} compact />
      <section className="pb-14 pt-6 md:pb-20 md:pt-8">
        <div className="site-shell">
          <nav aria-label="Filter projects by stage" className="mb-7 md:mb-8">
            <div className="flex gap-1 overflow-x-auto pb-1 sm:gap-2 md:justify-center">
              {tabs.map((tab) => {
                const active = (stage ?? "all") === tab.value;
                return (
                  <Link
                    key={tab.value}
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    aria-label={`${tab.label} projects (${counts[tab.value]})`}
                    className={`inline-flex min-h-11 shrink-0 items-center justify-center px-3 text-xs font-bold uppercase tracking-[0.08em] transition-colors sm:px-6 sm:text-sm ${active ? "bg-bhumi text-white" : "bg-slate-100 text-ink hover:bg-slate-200"}`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          {filteredProjects.length > 0 ? (
            <div className="grid gap-x-5 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  variant="listing"
                />
              ))}
            </div>
          ) : (
            <ContentEmptyState
              title={
                stage
                  ? `No ${stage} projects yet.`
                  : "Project records are being updated."
              }
              detail={
                stage
                  ? "Published projects in this stage will appear here."
                  : "Verified project details and portfolio photography will appear here shortly."
              }
            />
          )}
          {site.editorial.projectsPageCta && (
            <ButtonLink href="/contact" variant="text" className="mt-12">
              {site.editorial.projectsPageCta} <ArrowUpRight size={16} />
            </ButtonLink>
          )}
        </div>
      </section>
    </>
  );
}

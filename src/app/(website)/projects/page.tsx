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
      <PageIntro page="projects" intro={site.pageIntros.projects} />
      <section className="py-16 md:py-28">
        <div className="site-shell">
          <nav
            aria-label="Filter projects by stage"
            className="mb-12 border-b border-line"
          >
            <div className="-mb-px flex gap-7 overflow-x-auto">
              {tabs.map((tab) => {
                const active = (stage ?? "all") === tab.value;
                return (
                  <Link
                    key={tab.value}
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex shrink-0 items-center gap-2 border-b-2 pb-4 text-sm font-semibold transition-colors ${active ? "border-bhumi text-bhumi" : "border-transparent text-muted hover:text-ink"}`}
                  >
                    {tab.label}
                    <span className="text-xs tabular-nums opacity-65">
                      {counts[tab.value]}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
          {filteredProjects.length > 0 ? (
            <div className="grid gap-x-7 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
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
          <ButtonLink href="/contact" variant="text" className="mt-12">
            Have a project in mind? <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

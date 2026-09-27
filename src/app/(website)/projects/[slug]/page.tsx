import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { GalleryGrid } from "@/components/website/gallery-grid";
import { MediaFrame } from "@/components/website/media-frame";
import { ProjectCard } from "@/components/website/project-card";
import { getProjectBySlug, getProjects } from "@/features/content/queries";

type PageProps = { params: Promise<{ slug: string }> };

function dateLabel(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
        date,
      );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return {
    title: project.title,
    description: project.description || `${project.title} — a BHUMI project.`,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: project.coverImage
      ? { images: [{ url: project.coverImage, alt: project.title }] }
      : undefined,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const related = (await getProjects())
    .filter(
      (item) =>
        item.id !== project.id &&
        (!project.category || item.category === project.category),
    )
    .slice(0, 3);
  const facts = [
    ["Location", project.location],
    ["Client", project.client],
    ["Main contractor", project.mainContractor],
    ["Financing", project.financing],
    ["Start", dateLabel(project.startDate)],
    ["Completion", dateLabel(project.completionDate)],
    ["Manpower", project.manpower],
    ["Status", project.projectStatus],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="site-shell py-7">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-bhumi"
          >
            <ArrowLeft size={16} /> All projects
          </Link>
        </div>
        <div className="site-shell grid gap-10 pb-12 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.5fr)] md:items-end md:pb-16">
          <div>
            <p className="eyebrow">
              {project.category || "Project case study"}
            </p>
            <h1 className="display-title mt-6">{project.title}</h1>
            {project.description && (
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
                {project.description}
              </p>
            )}
          </div>
          {project.location && (
            <p className="border-l border-bhumi pl-5 text-sm leading-6 text-muted">
              {project.location}
            </p>
          )}
        </div>
      </section>

      <section className="site-shell py-8 md:py-12">
        <div className="relative aspect-[1.55/1] min-h-[300px] overflow-hidden">
          <MediaFrame
            src={project.coverImage}
            alt={project.title}
            className="absolute inset-0 h-full w-full"
            priority
            sizes="100vw"
            label="Add cover image"
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="site-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-20">
          <div>
            {project.description && (
              <>
                <p className="eyebrow">Overview</p>
                <h2 className="section-title mt-5">Project overview.</h2>
                <p className="mt-7 max-w-3xl whitespace-pre-line text-base leading-8 text-muted">
                  {project.description}
                </p>
              </>
            )}
            {project.scopeOfWork && (
              <div className="mt-14 border-t border-line pt-8">
                <p className="eyebrow">Scope of work</p>
                <p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-8 text-muted">
                  {project.scopeOfWork}
                </p>
              </div>
            )}
            {project.executionDetails && (
              <div className="mt-14 border-t border-line pt-8">
                <p className="eyebrow">Portfolio execution snapshot</p>
                <p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-8 text-muted">
                  {project.executionDetails}
                </p>
              </div>
            )}
          </div>
          {facts.length > 0 && (
            <aside className="self-start border-y border-line">
              <p className="px-0 py-5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Project facts
              </p>
              {facts.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-t border-line py-4 text-sm"
                >
                  <span className="text-muted">{label}</span>
                  <span className="max-w-[58%] text-right font-semibold text-ink">
                    {value}
                  </span>
                </div>
              ))}
            </aside>
          )}
        </div>
      </section>

      {project.images.length > 0 && (
        <section className="border-y border-line bg-canvas py-16 md:py-24">
          <div className="site-shell">
            <p className="eyebrow">Project gallery</p>
            <h2 className="section-title mt-5">Documented on site.</h2>
            <div className="mt-10">
              <GalleryGrid images={project.images} />
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="site-shell">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">More work</p>
                <h2 className="section-title mt-5">Related projects.</h2>
              </div>
              <ButtonLink href="/projects" variant="text" className="shrink-0">
                All projects <ArrowUpRight size={16} />
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {related.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

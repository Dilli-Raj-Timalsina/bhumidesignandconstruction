import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MediaFrame } from "./media-frame";

export type ProjectCardData = {
  title: string;
  slug: string;
  category?: string | null;
  location?: string | null;
  description?: string | null;
  coverImage?: string | null;
};

export function ProjectCard({
  project,
  variant = "default",
}: {
  project: ProjectCardData;
  variant?: "default" | "feature";
}) {
  const large = variant === "feature";
  return (
    <article
      className={
        large
          ? "grid gap-6 md:grid-cols-[minmax(0,1.45fr)_minmax(250px,0.65fr)] md:gap-10"
          : "group"
      }
    >
      <Link
        href={`/projects/${project.slug}`}
        className={
          large
            ? "relative block min-h-[340px] overflow-hidden md:min-h-[500px]"
            : "relative block aspect-[1.13/1] overflow-hidden"
        }
      >
        <MediaFrame
          src={project.coverImage}
          alt={project.title}
          className="absolute inset-0 h-full w-full"
          sizes={
            large
              ? "(max-width: 768px) 100vw, 65vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
        />
      </Link>
      <div className={large ? "flex flex-col justify-end py-2" : "pt-4"}>
        {(project.category || project.location) && (
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-bhumi">
            {[project.category, project.location].filter(Boolean).join(" · ")}
          </p>
        )}
        <h3
          className={
            large
              ? "mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-ink md:text-4xl"
              : "mt-2 text-xl font-semibold leading-tight tracking-[-0.035em] text-ink"
          }
        >
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors hover:text-bhumi"
          >
            {project.title}
          </Link>
        </h3>
        {project.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
            {project.description}
          </p>
        )}
        <Link
          href={`/projects/${project.slug}`}
          className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-bhumi"
        >
          View project{" "}
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </article>
  );
}

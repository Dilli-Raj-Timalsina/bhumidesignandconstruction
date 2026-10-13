import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { ContentEmptyState } from "@/components/website/empty-content";
import { GalleryGrid } from "@/components/website/gallery-grid";
import {
  CompanyHighlights,
  ServiceOfferings,
} from "@/components/website/marketing-sections";
import { MediaFrame } from "@/components/website/media-frame";
import { ProjectCard } from "@/components/website/project-card";
import { SectionHeading } from "@/components/website/section-heading";
import { CtaSection } from "@/components/website/cta-section";
import {
  getAllGalleryImages,
  getFeaturedProject,
  getGalleryAlbums,
  getProjects,
  getServices,
  getSiteContent,
} from "@/features/content/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [site, featuredProject, projects, albums, services] = await Promise.all(
    [
      getSiteContent(),
      getFeaturedProject(),
      getProjects(6),
      getGalleryAlbums(4),
      getServices(6),
    ],
  );
  const galleryImages = getAllGalleryImages(albums).slice(0, 8);

  return (
    <>
      <section className="relative isolate min-h-[calc(100svh-76px)] overflow-hidden bg-ink text-white">
        {site.heroImage && (
          <>
            <Image
              src={site.heroImage}
              alt="BHUMI project work"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-[#101824]/60"
              aria-hidden="true"
            />
          </>
        )}
        <div className="site-shell relative z-10 flex min-h-[calc(100svh-76px)] flex-col justify-center pb-24 pt-16 sm:py-28">
          <div className="max-w-[960px] animate-soft-rise">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
              <span className="h-px w-7 bg-white/80" aria-hidden="true" />
              Civil engineering + construction
            </p>
            {site.heroTitle ? (
              <h1 className="mt-6 max-w-[940px] text-[clamp(2.75rem,5.5vw,5rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:mt-7">
                {site.heroTitle}
              </h1>
            ) : (
              <h1 className="sr-only">BHUMI Design & Construction</h1>
            )}
            {site.heroDescription && (
              <p className="mt-6 max-w-xl text-sm leading-7 text-white/85 sm:mt-7 sm:text-base sm:leading-8 md:text-lg">
                {site.heroDescription}
              </p>
            )}
            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <ButtonLink
                href="/projects"
                size="lg"
                className="w-full sm:w-auto"
              >
                View projects <ArrowUpRight size={17} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href="/contact"
                size="lg"
                variant="outline"
                className="w-full border-white/75 text-white hover:border-white hover:bg-white hover:text-ink sm:w-auto"
              >
                Contact us
              </ButtonLink>
            </div>
          </div>
          <a
            href="#home-highlights"
            className="group absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors hover:text-white md:bottom-6"
          >
            <span>Scroll to explore</span>
            <ArrowDown
              size={15}
              strokeWidth={1.7}
              aria-hidden="true"
              className="motion-safe:animate-scroll-cue"
            />
          </a>
        </div>
      </section>

      <div id="home-highlights" className="scroll-mt-[76px]">
        <CompanyHighlights />
      </div>

      <section className="bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <div className="grid gap-8 md:grid-cols-[0.75fr_1.25fr] md:gap-16">
            <p className="eyebrow self-start">Our practice</p>
            <div>
              {site.description && (
                <p className="max-w-3xl text-[clamp(1.7rem,3vw,2.8rem)] font-semibold leading-[1.18] tracking-[-0.045em] text-ink">
                  {site.description}
                </p>
              )}
              <div className="mt-10 grid border-t border-line sm:grid-cols-3">
                {[
                  [
                    "01",
                    "Civil engineering-led",
                    "Founded and led by Er. Shashiram Nakal, a Pulchowk Campus civil engineering graduate.",
                  ],
                  [
                    "02",
                    "Built to execute",
                    "Civil and structural work spanning RCC, masonry, foundations, and substation civil works.",
                  ],
                  [
                    "03",
                    "On-site capacity",
                    "Three site supervisors / overseers and approximately 40 workers across running sites.",
                  ],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="border-b border-line py-5 pr-5 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0"
                  >
                    <p className="text-xs font-bold tracking-[0.08em] text-bhumi">
                      {number}
                    </p>
                    <p className="mt-5 text-lg font-semibold tracking-[-0.025em] text-ink">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-28">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="relative min-h-[380px] md:min-h-[530px]">
            <MediaFrame
              src={site.aboutImage}
              alt="BHUMI project work"
              className="absolute inset-0 h-full w-full"
              label="BHUMI project work"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
          <div className="flex flex-col justify-center py-2">
            <p className="eyebrow">About BHUMI</p>
            {site.aboutTitle && (
              <h2 className="section-title mt-5 max-w-xl">{site.aboutTitle}</h2>
            )}
            {site.aboutContent && (
              <p className="mt-6 max-w-xl whitespace-pre-line text-base leading-8 text-muted">
                {site.aboutContent}
              </p>
            )}
            <ButtonLink href="/about" variant="text" className="mt-8 w-fit">
              About Bhumi <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-16 md:py-28">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Services"
            title={
              <>
                From first sketch
                <br />
                to final handover.
              </>
            }
            description="Practical support for every stage of your project — from early advice and design through construction, quality checks, and handover."
          />
          <div className="mt-10 md:mt-14">
            {services.length > 0 ? (
              <ServiceOfferings services={services} />
            ) : (
              <ContentEmptyState
                title="Services are being updated."
                detail="Published services will appear here shortly."
              />
            )}
          </div>
          <ButtonLink href="/services" variant="text" className="mt-8">
            Explore services <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
      </section>

      <section className="py-16 md:py-28">
        <div className="site-shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Selected work</p>
              <h2 className="section-title mt-5">
                Work in progress. Work delivered.
              </h2>
            </div>
            <ButtonLink href="/projects" variant="text">
              All projects <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
          <div className="mt-10 md:mt-14">
            {featuredProject ? (
              <ProjectCard project={featuredProject} variant="feature" />
            ) : (
              <div className="grid gap-6 md:grid-cols-[1.45fr_0.65fr] md:gap-10">
                <MediaFrame
                  className="min-h-[340px] md:min-h-[500px]"
                  label="Add featured project photography"
                />
                <ContentEmptyState
                  title="Featured project pending"
                  detail="Publish a project and mark it featured to place a case study here."
                />
              </div>
            )}
          </div>
          {projects.length > 1 && (
            <div className="mt-14 grid gap-x-6 gap-y-12 md:grid-cols-3">
              {projects
                .filter((project) => project.id !== featuredProject?.id)
                .slice(0, 3)
                .map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-16 md:py-28">
        <div className="site-shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">In the field</p>
              <h2 className="section-title mt-5">A closer look at the work.</h2>
            </div>
            <ButtonLink href="/gallery" variant="text">
              Open gallery <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
          <div className="mt-10 md:mt-14">
            {galleryImages.length > 0 ? (
              <GalleryGrid images={galleryImages} compact />
            ) : (
              <ContentEmptyState
                title="Project gallery pending"
                detail="Images can be organized into albums with captions and alt text from the gallery workspace."
              />
            )}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}

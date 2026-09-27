import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { BlogCard } from "@/components/website/blog-card";
import { ContentEmptyState } from "@/components/website/empty-content";
import { GalleryGrid } from "@/components/website/gallery-grid";
import { MediaFrame } from "@/components/website/media-frame";
import { ProjectCard } from "@/components/website/project-card";
import { SectionHeading } from "@/components/website/section-heading";
import { ServiceList } from "@/components/website/service-list";
import { CtaSection } from "@/components/website/cta-section";
import {
  getAllGalleryImages,
  getFeaturedProject,
  getGalleryAlbums,
  getPosts,
  getProjects,
  getServices,
  getSiteContent,
} from "@/features/content/queries";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 300;

export default async function HomePage() {
  const [site, services, featuredProject, projects, albums, posts] =
    await Promise.all([
      getSiteContent(),
      getServices(6),
      getFeaturedProject(),
      getProjects(6),
      getGalleryAlbums(4),
      getPosts(3),
    ]);
  const galleryImages = getAllGalleryImages(albums).slice(0, 8);

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="site-shell grid min-h-[min(780px,calc(100svh-76px))] gap-10 py-10 md:grid-cols-[minmax(0,0.96fr)_minmax(380px,1.04fr)] md:py-12 xl:gap-20">
          <div className="flex flex-col justify-between py-2 md:py-8">
            <div className="animate-soft-rise">
              <p className="eyebrow">Civil engineering + construction</p>
              <h1 className="display-title mt-7 max-w-3xl">
                Built with engineering.
                <br />
                Delivered with precision.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-muted md:text-lg">
                {site.description}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/projects">
                  View projects <ArrowUpRight size={17} />
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline">
                  Contact us
                </ButtonLink>
              </div>
            </div>
            <div className="mt-12 flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted md:mt-0">
              <span className="grid h-8 w-8 place-items-center border border-line text-bhumi">
                <ArrowDownRight size={15} />
              </span>
              <span>From concept to construction</span>
            </div>
          </div>
          <div className="relative min-h-[390px] overflow-hidden md:min-h-0">
            <MediaFrame
              src={site.heroImage}
              alt="BHUMI project site"
              className="absolute inset-0 h-full w-full"
              priority
              sizes="(max-width: 768px) 100vw, 52vw"
              label="Add BHUMI project photography"
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between bg-white/90 px-5 py-4 backdrop-blur-sm md:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bhumi">
                  BHUMI
                </p>
                <p className="mt-1 text-xs font-medium text-ink">
                  Design with intent. Build with clarity.
                </p>
              </div>
              <span className="hidden h-9 w-9 border border-line bg-white sm:block" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <div className="grid gap-8 md:grid-cols-[0.75fr_1.25fr] md:gap-16">
            <p className="eyebrow self-start">Our practice</p>
            <div>
              <p className="max-w-3xl text-[clamp(1.7rem,3vw,2.8rem)] font-semibold leading-[1.18] tracking-[-0.045em] text-ink">
                A modern practice for civil engineering and construction
                solutions.
              </p>
              <div className="mt-10 grid border-t border-line sm:grid-cols-3">
                {[
                  [
                    "01",
                    "Engineering-led",
                    "Technical thinking anchors every stage of the work.",
                  ],
                  [
                    "02",
                    "Built to execute",
                    "Design intent stays close to construction reality.",
                  ],
                  [
                    "03",
                    "Project focused",
                    "Clear coordination from planning through delivery.",
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
              alt="BHUMI work"
              className="absolute inset-0 h-full w-full"
              label="Add a BHUMI site image"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
          <div className="flex flex-col justify-center py-2">
            <p className="eyebrow">About BHUMI</p>
            <h2 className="section-title mt-5 max-w-xl">
              Design discipline. Construction perspective.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted">
              {site.aboutContent ||
                "BHUMI DESIGN & CONSTRUCTION PVT. LTD. is a civil engineering and construction practice based in Tulsipur, Dang, Nepal. Its company profile and project story can be managed here as the portfolio develops."}
            </p>
            <ButtonLink href="/about" variant="text" className="mt-8 w-fit">
              About Bhumi <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-16 md:py-28">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Capabilities"
            title={
              <>
                Thoughtful planning.
                <br />
                Confident execution.
              </>
            }
            description="Services are managed in the CMS, so the work shown here remains current as BHUMI's portfolio evolves."
          />
          <div className="mt-10 md:mt-14">
            {services.length > 0 ? (
              <ServiceList services={services} />
            ) : (
              <ContentEmptyState
                title="Capabilities will appear here."
                detail="Publish supported services from the content workspace to introduce BHUMI’s current capabilities."
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
              <h2 className="section-title mt-5">The work speaks clearly.</h2>
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

      <section className="py-16 md:py-28">
        <div className="site-shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Insights</p>
              <h2 className="section-title mt-5">Notes from the practice.</h2>
            </div>
            <ButtonLink href="/insights" variant="text">
              All insights <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
          <div className="mt-10 md:mt-14">
            {posts.length > 0 ? (
              <div className="grid gap-10 md:grid-cols-3 md:gap-7">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <ContentEmptyState
                title="No insights published yet."
                detail="Published articles will be shown here when they are ready to share."
              />
            )}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}

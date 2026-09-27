import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { CtaSection } from "@/components/website/cta-section";
import { MediaFrame } from "@/components/website/media-frame";
import { SectionHeading } from "@/components/website/section-heading";
import { getSiteContent } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "About",
  description:
    "About BHUMI Design & Construction, a civil engineering and construction practice in Tulsipur, Dang, Nepal.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const site = await getSiteContent();
  const narrative =
    site.aboutContent ||
    "BHUMI DESIGN & CONSTRUCTION PVT. LTD. is a civil engineering and construction practice based in Tulsipur, Dang, Nepal. As the company portfolio grows, its complete story, team and project approach can be maintained here through the site workspace.";
  return (
    <>
      <section className="border-b border-line bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <p className="eyebrow">About BHUMI</p>
          <h1 className="display-title mt-6 max-w-5xl">
            Design and construction, considered as one.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            A civil engineering and construction practice in Tulsipur, Dang,
            Nepal.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-28">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <div className="relative min-h-[430px] lg:min-h-[620px]">
            <MediaFrame
              src={site.aboutImage}
              alt="BHUMI work"
              className="absolute inset-0 h-full w-full"
              label="Add company or site photography"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow">The practice</p>
            <h2 className="section-title mt-5">
              Engineering perspective, construction focus.
            </h2>
            <div className="mt-7 max-w-xl whitespace-pre-line text-base leading-8 text-muted">
              {narrative}
            </div>
            <ButtonLink href="/contact" variant="text" className="mt-9 w-fit">
              Talk about your project <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-canvas py-16 md:py-28">
        <div className="site-shell">
          <SectionHeading
            eyebrow="How we work"
            title={
              <>
                Clear thinking at
                <br />
                every stage.
              </>
            }
            description="Company-specific process details can be added through the site settings as the portfolio and operating approach are documented."
          />
          <div className="mt-12 grid gap-px bg-line md:grid-cols-3">
            {[
              [
                "01",
                "Understand",
                "Define the brief, site context and project requirements.",
              ],
              [
                "02",
                "Coordinate",
                "Bring design intent and construction planning into view together.",
              ],
              [
                "03",
                "Deliver",
                "Keep attention on execution, quality and practical outcomes.",
              ],
            ].map(([number, title, copy]) => (
              <article key={number} className="bg-canvas p-7 md:p-8">
                <p className="text-xs font-bold tracking-[0.08em] text-bhumi">
                  {number}
                </p>
                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}

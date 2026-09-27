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
    "BHUMI Design & Construction is a Tulsipur-based civil engineering and construction contracting company.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const site = await getSiteContent();
  const narrative =
    site.aboutContent ||
    "BHUMI Design and Construction Pvt. Ltd. is a civil engineering and construction contracting company based in Tulsipur, Dang, Nepal, founded and led by Er. Shashiram Nakal. The company focuses on turnkey and civil contracting work for private residential clients and institutional infrastructure projects.";
  return (
    <>
      <section className="border-b border-line bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <p className="eyebrow">About BHUMI</p>
          <h1 className="display-title mt-6 max-w-5xl">
            Engineering-led construction, from foundation to finish.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            A Tulsipur-based contractor for turnkey residential work and
            institutional civil infrastructure.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-28">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <div className="relative min-h-[430px] lg:min-h-[620px]">
            <MediaFrame
              src={site.aboutImage}
              alt="BHUMI completed structure work in Dang"
              className="absolute inset-0 h-full w-full"
              label="BHUMI project work"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow">The practice</p>
            <h2 className="section-title mt-5">
              {site.aboutTitle || "Turnkey delivery, grounded in engineering."}
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
            eyebrow="Current capacity"
            title={
              <>
                Built for active,
                <br />
                on-site delivery.
              </>
            }
            description="Organizational capacity as documented in BHUMI’s current company portfolio."
          />
          <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "01",
                "Er. Shashiram Nakal",
                "Founder / MD / CEO; civil engineering graduate of Pulchowk Campus, Institute of Engineering.",
              ],
              [
                "02",
                "3 site supervisors / overseers",
                "Currently deployed across active sites.",
              ],
              [
                "03",
                "Approx. 40 workers",
                "Across running sites in the portfolio snapshot.",
              ],
              [
                "04",
                "6 running sites",
                "Current active-site count documented in BHUMI’s company portfolio.",
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

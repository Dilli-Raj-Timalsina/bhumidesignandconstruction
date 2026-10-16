import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { CtaSection } from "@/components/website/cta-section";
import { ProcessTimeline } from "@/components/website/marketing-sections";
import { MediaFrame } from "@/components/website/media-frame";
import { PageIntro } from "@/components/website/page-intro";
import { SectionHeading } from "@/components/website/section-heading";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getSiteContent } from "@/features/content/queries";

export const generateMetadata = () => getPageIntroMetadata("about", "/about");

export default async function AboutPage() {
  const site = await getSiteContent();
  const copy = site.editorial;
  return (
    <>
      <PageIntro page="about" intro={site.pageIntros.about} />

      <section className="py-16 md:py-28">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <div className="relative min-h-[430px] lg:min-h-[620px]">
            <MediaFrame
              src={site.aboutImage}
              alt={site.aboutImageAlt || "BHUMI project work"}
              className="absolute inset-0 h-full w-full"
              label="BHUMI project work"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div className="flex flex-col justify-center">
            {copy.aboutPracticeEyebrow && (
              <p className="eyebrow">{copy.aboutPracticeEyebrow}</p>
            )}
            {site.aboutTitle && (
              <h2 className="section-title mt-5">{site.aboutTitle}</h2>
            )}
            {site.aboutContent && (
              <div className="mt-7 max-w-xl whitespace-pre-line text-base leading-8 text-muted">
                {site.aboutContent}
              </div>
            )}
            {copy.aboutPracticeCta && (
              <ButtonLink href="/contact" variant="text" className="mt-9 w-fit">
                {copy.aboutPracticeCta} <ArrowUpRight size={16} />
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      {(copy.capacityEyebrow ||
        copy.capacityTitle ||
        copy.capacityDescription ||
        copy.capacityCards.length > 0) && (
        <section className="border-y border-line bg-canvas py-16 md:py-28">
          <div className="site-shell">
            <SectionHeading
              eyebrow={copy.capacityEyebrow}
              title={copy.capacityTitle}
              description={copy.capacityDescription}
            />
            {copy.capacityCards.length > 0 && (
              <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
                {copy.capacityCards.map(({ title, description }, index) => (
                  <article key={index} className="bg-canvas p-7 md:p-8">
                    <p className="text-xs font-bold tracking-[0.08em] text-bhumi">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-10 text-2xl font-semibold tracking-[-0.04em] text-ink">
                      {title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-muted">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <ProcessTimeline content={copy} />
      <CtaSection content={copy} />
    </>
  );
}
